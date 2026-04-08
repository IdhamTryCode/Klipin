import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processVideo } from "@/inngest/functions/process-video";
import { handleJobFailure } from "@/inngest/functions/handle-failure";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processVideo, handleJobFailure],
});
