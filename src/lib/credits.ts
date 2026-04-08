export const MAX_VIDEO_DURATION_SECONDS = 10800; // 3 jam
export const MAX_TOKEN_ESTIMATE = 200_000;

export function calculateCreditsRequired(durationSeconds: number): number {
  const minutes = durationSeconds / 60;
  if (minutes <= 30) return 1;
  if (minutes <= 60) return 2;
  if (minutes <= 120) return 3;
  if (minutes <= 180) return 5;
  return -1;
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 3);
}
