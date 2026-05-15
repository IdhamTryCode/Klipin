import { NonRetriableError } from "inngest";
import { inngest } from "../client";
import { fetchTranscript } from "@/lib/transcript";
import { estimateTokenCount, MAX_TOKEN_ESTIMATE } from "@/lib/credits";
import { callKimi } from "@/lib/ai/kimi";
import { createServiceRoleClient } from "@/lib/supabase/server";

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export const processVideo = inngest.createFunction(
  {
    id: "process-video-clips",
    concurrency: { key: "event.data.userId", limit: 3 },
    retries: 2,
    triggers: [{ event: "klipin/video.submitted" }],
  },
  async ({ event, step }: { event: { data: { jobId: string; userId: string; videoId: string; customPrompt: string } }; step: { run: <T>(name: string, fn: () => Promise<T>) => Promise<T> } }) => {
    const { jobId, videoId, customPrompt } = event.data;
    const supabase = createServiceRoleClient();

    // Step 1: prepare transcript in DB cache + validate token count.
    // We intentionally do NOT return transcript text — large step outputs are replayed
    // across step boundaries by Inngest and add real latency. Subsequent steps read from cache.
    const { tokens } = await step.run("prepare-transcript", async () => {
      const { data: cached } = await supabase
        .from("transcript_cache")
        .select("transcript_text")
        .eq("youtube_video_id", videoId)
        .maybeSingle();

      let text: string;
      if (cached) {
        text = cached.transcript_text;
      } else {
        try {
          const result = await fetchTranscript(videoId);
          text = result.text;
          await supabase.from("transcript_cache").upsert({
            youtube_video_id: videoId,
            transcript_text: result.text,
            transcript_language: result.language,
            token_count_estimate: estimateTokenCount(result.text),
          });
        } catch (e) {
          throw new NonRetriableError("TRANSCRIPT_UNAVAILABLE", { cause: e });
        }
      }

      const t = estimateTokenCount(text);
      if (t > MAX_TOKEN_ESTIMATE) {
        throw new NonRetriableError(`TRANSCRIPT_TOO_LONG:${t}`);
      }

      await supabase
        .from("video_jobs")
        .update({ status: "processing", processing_started_at: new Date().toISOString() })
        .eq("id", jobId);

      return { tokens: t };
    });
    void tokens;

    // Step 2: AI extraction + save. Reads transcript fresh from DB cache so the large text
    // never crosses an Inngest step boundary. Combined with save to avoid passing the clips
    // array (also large) through another boundary.
    await step.run("extract-and-save", async () => {
      const { data: cached } = await supabase
        .from("transcript_cache")
        .select("transcript_text")
        .eq("youtube_video_id", videoId)
        .single();
      if (!cached) throw new NonRetriableError("TRANSCRIPT_CACHE_MISSING");

      const aiResult = await callKimi(cached.transcript_text, customPrompt);

      const rows = aiResult.clips.map((c, idx) => ({
        job_id: jobId,
        clip_index: idx + 1,
        start_time_seconds: c.start_time_seconds,
        end_time_seconds: c.end_time_seconds,
        start_time_display: fmtTime(c.start_time_seconds),
        end_time_display: fmtTime(c.end_time_seconds),
        hook_text: c.hook_text,
        reasoning: c.reasoning,
        suggested_caption: c.suggested_caption,
        virality_score: c.virality_score,
      }));
      await supabase.from("generated_clips").insert(rows);
      await supabase
        .from("video_jobs")
        .update({
          status: "success",
          processing_completed_at: new Date().toISOString(),
          ai_provider: aiResult.provider,
          ai_model: aiResult.model,
          input_tokens: aiResult.usage.input,
          output_tokens: aiResult.usage.output,
        })
        .eq("id", jobId);
    });

    return { success: true, jobId };
  }
);
