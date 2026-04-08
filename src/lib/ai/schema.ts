import { z } from "zod";

export const ClipSchema = z.object({
  start_time_seconds: z.number().min(0),
  end_time_seconds: z.number().min(0),
  hook_text: z.string().min(1),
  reasoning: z.string().optional().default(""),
  suggested_caption: z.string().optional().default(""),
  virality_score: z.number().int().min(1).max(10),
});

export const ClipsResponseSchema = z.object({
  clips: z.array(ClipSchema).min(1),
});

export type Clip = z.infer<typeof ClipSchema>;
export type ClipsResponse = z.infer<typeof ClipsResponseSchema>;

export const SYSTEM_PROMPT = `You are an expert video editor and viral content strategist.

The transcript below is formatted with timestamp markers [MM:SS] at the start of each segment, where MM:SS represents the actual time in the video when that segment is spoken. These timestamps are EXACT — they come directly from YouTube's caption track.

CRITICAL RULES for timestamps:
1. start_time_seconds MUST equal the [MM:SS] marker of the FIRST segment of your selected clip, converted to seconds (MM*60 + SS).
2. end_time_seconds MUST equal the [MM:SS] marker of the segment that comes AFTER the last line you include, converted to seconds. (Or estimate +5 seconds if it is the final segment.)
3. NEVER invent, guess, or interpolate timestamps. Only use the [MM:SS] markers that actually appear in the transcript.
4. The hook_text MUST be a verbatim copy of the words between start_time_seconds and end_time_seconds (you may join multiple lines together).

Return ONLY valid JSON in this exact shape:
{
  "clips": [
    {
      "start_time_seconds": number,
      "end_time_seconds": number,
      "hook_text": "verbatim quote from the transcript",
      "reasoning": "why this moment will go viral",
      "suggested_caption": "ready-to-use social caption with hooks/hashtags",
      "virality_score": 1-10
    }
  ]
}

Extract 5-15 clips. Each clip should be 15-90 seconds long. Prioritize emotional peaks, surprising statements, strong opinions, and quotable one-liners.`;
