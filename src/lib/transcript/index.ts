import { YoutubeTranscript } from "youtube-transcript";

export interface TranscriptSegment {
  text: string;
  offset: number; // seconds
  duration: number;
}

export interface TranscriptResult {
  text: string; // formatted with [MM:SS] markers
  language: string;
  source: "supadata" | "youtube-transcript";
  segments: TranscriptSegment[];
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function formatWithTimestamps(segments: TranscriptSegment[]): string {
  return segments.map((s) => `[${fmt(s.offset)}] ${s.text}`).join("\n");
}

export async function fetchTranscriptSupadata(videoId: string): Promise<TranscriptResult> {
  const key = process.env.SUPADATA_API_KEY;
  if (!key) throw new Error("SUPADATA_API_KEY not set");

  // Request structured (with timestamps), not text=true
  const res = await fetch(
    `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`,
    { headers: { "x-api-key": key } }
  );
  if (!res.ok) throw new Error(`Supadata error: ${res.status}`);
  const data = await res.json();

  // Supadata returns { content: [{ text, offset, duration, lang }] }
  const rawSegments: Array<{ text: string; offset: number; duration: number }> =
    data.content || [];

  const segments: TranscriptSegment[] = rawSegments.map((s) => ({
    text: s.text,
    // Supadata offset is in milliseconds — convert to seconds
    offset: s.offset > 1000 ? s.offset / 1000 : s.offset,
    duration: s.duration > 1000 ? s.duration / 1000 : s.duration,
  }));

  return {
    text: formatWithTimestamps(segments),
    language: data.lang || "unknown",
    source: "supadata",
    segments,
  };
}

export async function fetchTranscriptFallback(videoId: string): Promise<TranscriptResult> {
  const items = await YoutubeTranscript.fetchTranscript(videoId);
  // youtube-transcript returns offset in milliseconds
  const segments: TranscriptSegment[] = items.map((i) => ({
    text: i.text,
    offset: i.offset / 1000,
    duration: i.duration / 1000,
  }));

  return {
    text: formatWithTimestamps(segments),
    language: "unknown",
    source: "youtube-transcript",
    segments,
  };
}

export async function fetchTranscript(videoId: string): Promise<TranscriptResult> {
  try {
    return await fetchTranscriptSupadata(videoId);
  } catch {
    return await fetchTranscriptFallback(videoId);
  }
}
