import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { extractVideoId, fetchVideoMetadata } from "@/lib/youtube";
import {
  calculateCreditsRequired,
  MAX_VIDEO_DURATION_SECONDS,
} from "@/lib/credits";
import { inngest } from "@/inngest/client";

const BodySchema = z.object({
  youtubeUrl: z.string().url(),
  customPrompt: z.string().max(2000).optional().default(""),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let parsedJson: unknown;
  try {
    parsedJson = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }
  const body = BodySchema.safeParse(parsedJson);
  if (!body.success)
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });

  const videoId = extractVideoId(body.data.youtubeUrl);
  if (!videoId)
    return NextResponse.json({ error: "INVALID_YOUTUBE_URL" }, { status: 400 });

  let metadata;
  try {
    metadata = await fetchVideoMetadata(videoId);
  } catch (e: unknown) {
    console.error("YOUTUBE_FETCH_FAILED", e);
    return NextResponse.json({ error: "YOUTUBE_FETCH_FAILED" }, { status: 400 });
  }

  if (metadata.durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
    return NextResponse.json({ error: "VIDEO_TOO_LONG" }, { status: 400 });
  }

  const creditsRequired = calculateCreditsRequired(metadata.durationSeconds);
  if (creditsRequired < 0)
    return NextResponse.json({ error: "VIDEO_TOO_LONG" }, { status: 400 });

  const { count: activeCount } = await supabase
    .from("video_jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ["pending", "processing"]);
  if ((activeCount ?? 0) >= 3) {
    return NextResponse.json({ error: "TOO_MANY_ACTIVE_JOBS" }, { status: 429 });
  }

  // 1) Insert job FIRST so we always have a row to refund against if anything below fails.
  const { data: job, error: insertErr } = await supabase
    .from("video_jobs")
    .insert({
      user_id: user.id,
      youtube_url: body.data.youtubeUrl,
      youtube_video_id: videoId,
      video_title: metadata.title,
      video_duration_seconds: metadata.durationSeconds,
      channel_name: metadata.channelTitle,
      thumbnail_url: metadata.thumbnailUrl,
      custom_prompt: body.data.customPrompt,
      credits_charged: creditsRequired,
    })
    .select()
    .single();

  if (insertErr || !job) {
    return NextResponse.json({ error: "JOB_CREATE_FAILED" }, { status: 500 });
  }

  // 2) Deduct credits atomically. If it fails, mark job failed_payment (no refund needed — nothing was charged).
  const { data: deductResult, error: deductErr } = await supabase.rpc("deduct_credits", {
    p_user_id: user.id,
    p_amount: creditsRequired,
    p_reference_id: job.id,
    p_description: `Process ${metadata.title}`,
  });
  if (deductErr || !deductResult?.[0]?.success) {
    await supabase
      .from("video_jobs")
      .update({ status: "failed", error_code: "INSUFFICIENT_CREDITS", error_message: "Saldo kredit tidak cukup" })
      .eq("id", job.id);
    return NextResponse.json({ error: "INSUFFICIENT_CREDITS" }, { status: 402 });
  }

  // 3) Send Inngest event. If this fails, refund and mark job failed.
  try {
    await inngest.send({
      name: "klipin/video.submitted",
      data: {
        jobId: job.id,
        userId: user.id,
        videoId,
        customPrompt: body.data.customPrompt,
      },
    });
  } catch (e: unknown) {
    console.error("INNGEST_SEND_FAILED", e);
    await supabase.rpc("refund_credits", {
      p_user_id: user.id,
      p_amount: creditsRequired,
      p_reference_id: job.id,
      p_description: "Refund: gagal antri job",
    });
    await supabase
      .from("video_jobs")
      .update({ status: "failed", error_code: "QUEUE_FAILED", error_message: "Gagal antri job, kredit dikembalikan" })
      .eq("id", job.id);
    return NextResponse.json({ error: "QUEUE_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ jobId: job.id });
}
