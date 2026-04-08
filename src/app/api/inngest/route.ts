import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processVideo } from "@/inngest/functions/process-video";
import { handleJobFailure } from "@/inngest/functions/handle-failure";

// Vercel: extend max duration. Hobby = 60s max, Pro = 300s, Enterprise = 900s.
export const maxDuration = 60;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processVideo, handleJobFailure],
});
