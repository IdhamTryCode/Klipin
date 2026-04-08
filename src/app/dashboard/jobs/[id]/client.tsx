"use client";

import useSWR from "swr";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Flame,
  Play,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardStrong } from "@/components/ui/card";

interface Clip {
  id: string;
  clip_index: number;
  start_time_display: string;
  end_time_display: string;
  start_time_seconds: number;
  hook_text: string;
  reasoning: string | null;
  suggested_caption: string | null;
  virality_score: number | null;
}

interface Job {
  id: string;
  video_title: string | null;
  youtube_url: string;
  youtube_video_id: string;
  status: string;
  error_message: string | null;
  credits_charged: number;
  video_duration_seconds: number | null;
  channel_name: string | null;
  thumbnail_url: string | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function JobDetailClient({ jobId }: { jobId: string }) {
  const { data, error } = useSWR<{ job: Job; clips: Clip[] }>(
    `/api/jobs/${jobId}`,
    fetcher,
    {
      refreshInterval: (latest) =>
        latest?.job?.status === "success" || latest?.job?.status === "failed"
          ? 0
          : 3000,
    }
  );

  if (error)
    return (
      <main className="p-8 text-center text-red-300">Error loading job</main>
    );
  if (!data)
    return (
      <main className="p-8 flex items-center justify-center gap-2 text-fg-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
      </main>
    );

  const { job, clips } = data;
  const isProcessing = job.status === "pending" || job.status === "processing";

  return (
    <>
      <Navbar
        rightSlot={
          <Link
            href="/dashboard"
            className="text-sm text-fg-muted hover:text-fg flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-4xl px-6 pt-12 pb-20">
        <header className="mb-8 flex gap-5 items-start"> 
          {job.thumbnail_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.thumbnail_url}
              alt=""
              className="w-40 aspect-video object-cover rounded-2xl border border-brand-400/15 shrink-0 hidden sm:block"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <StatusBadge status={job.status} />
              <span className="text-xs text-fg-muted">
                {job.credits_charged} kredit
              </span>
              {job.video_duration_seconds && (
                <span className="text-xs text-fg-muted">
                  · {Math.round(job.video_duration_seconds / 60)}m
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              {job.video_title || "Memuat judul..."}
            </h1>
            {job.channel_name && (
              <p className="text-sm text-fg-muted mt-1.5">{job.channel_name}</p>
            )}
          </div>
        </header>

        {isProcessing ? (
          <CardStrong className="text-center py-16">
            <Loader2 className="h-12 w-12 text-brand-300 animate-spin mx-auto mb-6" />
            <p className="text-lg font-semibold mb-2">
              {job.status === "pending"
                ? "Menunggu antrian..."
                : "AI sedang menganalisis transcript..."}
            </p>
            <p className="text-sm text-fg-muted">
              Halaman auto-refresh setiap 3 detik
            </p>
          </CardStrong>
        ) : job.status === "failed" ? (
          <Card className="border-red-500/30 bg-red-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300 mb-1">Job gagal</p>
                <p className="text-sm text-fg-muted">
                  {job.error_message || "Unknown error"}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <section className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Flame className="h-5 w-5 text-brand-300" />
                {clips.length} klip ditemukan
              </h2>
            </div>
            {clips.map((c) => (
              <ClipCard key={c.id} clip={c} videoId={job.youtube_video_id} />
            ))}
          </section>
        )}
      </main>
    </>
  );
}

function ClipCard({ clip, videoId }: { clip: Clip; videoId: string }) {
  const [copied, setCopied] = useState(false);

  function copyCaption() {
    if (!clip.suggested_caption) return;
    navigator.clipboard.writeText(clip.suggested_caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const score = clip.virality_score ?? 0;
  const scoreColor =
    score >= 9
      ? "text-red-300 bg-red-500/10 border-red-500/20"
      : score >= 7
      ? "text-orange-300 bg-orange-500/10 border-orange-500/20"
      : "text-yellow-300 bg-yellow-500/10 border-yellow-500/20";

  return (
    <article>
      <Card className="hover:border-brand-400/30 transition-colors space-y-3">
        <div className="flex items-start justify-between gap-3">
          <a
            href={`https://youtube.com/watch?v=${videoId}&t=${Math.floor(
              clip.start_time_seconds
            )}s`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-xs glass rounded-full px-3 py-1.5 hover:bg-brand-500/10 hover:border-brand-400/40 transition-all group"
          >
            <Play className="h-3 w-3 text-brand-300 group-hover:scale-110 transition-transform" />
            {clip.start_time_display} – {clip.end_time_display}
          </a>
          {clip.virality_score != null && (
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full border ${scoreColor} flex items-center gap-1.5`}
            >
              <Flame className="h-3 w-3" />
              {clip.virality_score}/10
            </span>
          )}
        </div>

        <p className="text-base leading-relaxed">{clip.hook_text}</p>

        {clip.reasoning && (
          <p className="text-sm text-fg-muted">
            <span className="text-brand-300 font-medium">Why viral:</span>{" "}
            {clip.reasoning}
          </p>
        )}

        {clip.suggested_caption && (
          <div className="relative group/caption">
            <div className="rounded-2xl border border-brand-400/15 bg-brand-500/5 p-4 pr-12 text-sm italic text-fg/90">
              {clip.suggested_caption}
            </div>
            <button
              onClick={copyCaption}
              className="absolute top-3 right-3 h-8 w-8 rounded-lg glass flex items-center justify-center opacity-0 group-hover/caption:opacity-100 transition-opacity hover:bg-brand-500/20"
              title="Copy caption"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-fg-muted" />
              )}
            </button>
          </div>
        )}
      </Card>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
    processing: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    success: "bg-green-500/10 text-green-300 border-green-500/20",
    failed: "bg-red-500/10 text-red-300 border-red-500/20",
    cancelled: "bg-neutral-500/10 text-neutral-300 border-neutral-500/20",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${
        styles[status] || ""
      }`}
    >
      {status}
    </span>
  );
}
