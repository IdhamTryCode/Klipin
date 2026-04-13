// YouTube Data API v3 client
const API_BASE = "https://www.googleapis.com/youtube/v3";

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function parseISO8601Duration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = parseInt(m[1] || "0", 10);
  const min = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  return h * 3600 + min * 60 + s;
}

export interface VideoMetadata {
  id: string;
  title: string;
  durationSeconds: number;
  thumbnailUrl: string;
  channelTitle: string;
}

export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY not set");

  const res = await fetch(
    `${API_BASE}/videos?part=contentDetails,snippet&id=${videoId}&key=${key}`,
    { signal: AbortSignal.timeout(10_000) }
  );
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();
  if (!data.items?.length) throw new Error("VIDEO_NOT_FOUND");

  const item = data.items[0];
  return {
    id: videoId,
    title: item.snippet.title,
    durationSeconds: parseISO8601Duration(item.contentDetails.duration),
    thumbnailUrl:
      item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    channelTitle: item.snippet.channelTitle || "",
  };
}
