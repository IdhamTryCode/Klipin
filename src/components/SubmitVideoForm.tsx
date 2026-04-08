"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { CardStrong } from "@/components/ui/card";

const ERROR_MAP: Record<string, string> = {
  INVALID_YOUTUBE_URL: "URL YouTube tidak valid",
  VIDEO_TOO_LONG: "Video terlalu panjang (maksimal 3 jam)",
  INSUFFICIENT_CREDITS: "Saldo kredit tidak cukup",
  TOO_MANY_ACTIVE_JOBS: "Sudah ada 3 job berjalan, tunggu dulu",
  YOUTUBE_FETCH_FAILED: "Gagal ambil metadata video",
};

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
        setError(ERROR_MAP[data.error] || data.error || "FAILED");
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
    <CardStrong className="p-7">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="h-5 w-5 text-brand-300" />
        <h2 className="text-lg font-semibold">Submit Video Baru</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted/60" />
          <Input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            disabled={loading}
            className="pl-11"
          />
        </div>

        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Custom instruction (opsional) — contoh: fokus pada momen lucu"
          rows={2}
          disabled={loading}
        />

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-red-400 px-2"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="w-full glow-brand"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Cari Klip Viral
            </>
          )}
        </Button>
      </form>
    </CardStrong>
  );
}
