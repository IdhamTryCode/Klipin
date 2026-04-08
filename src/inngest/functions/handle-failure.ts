import { inngest } from "../client";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const handleJobFailure = inngest.createFunction(
  {
    id: "handle-job-failure",
    triggers: [{ event: "inngest/function.failed", expression: "event.data.function_id == 'klipin-process-video-clips'" }],
  },
  async ({ event }: { event: { data: { event: { data: { jobId: string; userId: string } }; error: { message?: string } } } }) => {
    const supabase = createServiceRoleClient();
    const { jobId, userId } = event.data.event.data;
    const errorMsg = event.data.error?.message || "Unknown error";

    const { data: job } = await supabase
      .from("video_jobs")
      .select("credits_charged, status")
      .eq("id", jobId)
      .single();

    if (!job || job.status === "success") return { skipped: true };

    await supabase
      .from("video_jobs")
      .update({
        status: "failed",
        error_message: errorMsg,
        processing_completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    // Refund kredit
    await supabase.rpc("refund_credits", {
      p_user_id: userId,
      p_amount: job.credits_charged,
      p_reference_id: jobId,
      p_description: `Refund: ${errorMsg.substring(0, 100)}`,
    });

    return { refunded: job.credits_charged };
  }
);
