"use client";

import useSWR from "swr";
import Link from "next/link";

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
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function JobDetailClient({ jobId }: { jobId: string }) {
  const { data, error } = useSWR<{ job: Job; clips: Clip[] }>(
    `/api/jobs/${jobId}`,
    fetcher,
    {
      refreshInterval: (latest) =>
        latest?.job?.status === "success" || latest?.job?.status === "failed" ? 0 : 3000,
    }
  );

  if (error) return <main className="p-8">Error loading job</main>;
  if (!data) return <main className="p-8">Loading...</main>;

  const { job, clips } = data;

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-6">
      <Link href="/dashboard" className="text-sm text-neutral-500 hover:underline">
        ← Dashboard
      </Link>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{job.video_title || "Loading title..."}</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-900">
            {job.status}
          </span>
          <span className="text-neutral-500">{job.credits_charged} kredit</span>
        </div>
      </header>

      {job.status === "pending" || job.status === "processing" ? (
        <div className="rounded-lg border p-6 text-center space-y-2">
          <div className="animate-pulse text-neutral-500">
            {job.status === "pending" ? "Menunggu antrian..." : "AI sedang menganalisis transcript..."}
          </div>
          <p className="text-xs text-neutral-400">Halaman ini auto-refresh setiap 3 detik</p>
        </div>
      ) : job.status === "failed" ? (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950 p-6">
          <p className="font-semibold text-red-700 dark:text-red-300">Job gagal</p>
          <p className="text-sm mt-2">{job.error_message || "Unknown error"}</p>
        </div>
      ) : (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{clips.length} klip ditemukan</h2>
          {clips.map((c) => (
            <article key={c.id} className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between items-start gap-3">
                <a
                  href={`https://youtube.com/watch?v=${job.youtube_video_id}&t=${Math.floor(c.start_time_seconds)}s`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded hover:underline"
                >
                  {c.start_time_display} - {c.end_time_display}
                </a>
                {c.virality_score != null && (
                  <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                    🔥 {c.virality_score}/10
                  </span>
                )}
              </div>
              <p className="font-medium">{c.hook_text}</p>
              {c.reasoning && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  <strong>Kenapa viral:</strong> {c.reasoning}
                </p>
              )}
              {c.suggested_caption && (
                <p className="text-sm border-l-2 border-neutral-300 pl-3 italic">
                  {c.suggested_caption}
                </p>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
