"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubmitVideoForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl: url, customPrompt: prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "FAILED");
        setLoading(false);
        return;
      }
      router.push(`/dashboard/jobs/${data.jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "UNKNOWN");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-4">
      <div>
        <label className="text-sm font-medium">YouTube URL</label>
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="mt-1 w-full border rounded px-3 py-2"
          disabled={loading}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Custom prompt (opsional)</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Contoh: fokus pada momen lucu dan reaksi spontan"
          className="mt-1 w-full border rounded px-3 py-2"
          rows={2}
          disabled={loading}
        />
      </div>
      {error && <p className="text-sm text-red-600">Error: {error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white dark:bg-white dark:text-black rounded px-4 py-2 font-semibold disabled:opacity-50"
      >
        {loading ? "Memproses..." : "Cari Klip"}
      </button>
    </form>
  );
}
