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

    // Step 1: transcript
    const transcript = await step.run("fetch-transcript", async () => {
      const { data: cached } = await supabase
        .from("transcript_cache")
        .select("transcript_text, transcript_language")
        .eq("youtube_video_id", videoId)
        .maybeSingle();

      if (cached) {
        return { text: cached.transcript_text, language: cached.transcript_language };
      }

      const result = await fetchTranscript(videoId);
      await supabase.from("transcript_cache").upsert({
        youtube_video_id: videoId,
        transcript_text: result.text,
        transcript_language: result.language,
        token_count_estimate: estimateTokenCount(result.text),
      });
      return { text: result.text, language: result.language };
    });

    // Step 2: validate
    const formatted = await step.run("format-transcript", async () => {
      const tokens = estimateTokenCount(transcript.text);
      if (tokens > MAX_TOKEN_ESTIMATE) {
        throw new Error(`TRANSCRIPT_TOO_LONG: ${tokens}`);
      }
      await supabase
        .from("video_jobs")
        .update({ status: "processing", processing_started_at: new Date().toISOString() })
        .eq("id", jobId);
      return { text: transcript.text, tokens };
    });

    // Step 3: AI
    const aiResult = await step.run("ai-extract-clips", async () => {
      return await callKimi(formatted.text, customPrompt);
    });

    // Step 4: save
    await step.run("save-results", async () => {
      const rows = aiResult.clips.map((c: { start_time_seconds: number; end_time_seconds: number; hook_text: string; reasoning: string; suggested_caption: string; virality_score: number }, idx: number) => ({
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
