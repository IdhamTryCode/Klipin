import { inngest } from "../client";
import { createServiceRoleClient } from "@/lib/supabase/server";

function mapError(raw: string): { code: string; message: string } {
  if (raw.startsWith("TRANSCRIPT_TOO_LONG")) {
    return { code: "TRANSCRIPT_TOO_LONG", message: "Video ini terlalu panjang untuk diproses saat ini. Coba pilih video yang lebih pendek. Kredit Anda telah dikembalikan." };
  }
  if (raw.includes("TRANSCRIPT_UNAVAILABLE") || raw.includes("transcript")) {
    return { code: "TRANSCRIPT_UNAVAILABLE", message: "Kami tidak dapat membaca transcript video ini. Pastikan video memiliki caption/subtitle (CC) aktif, lalu coba lagi. Kredit Anda telah dikembalikan." };
  }
  if (raw.includes("Request timed out") || raw.includes("timeout")) {
    return { code: "TIMEOUT", message: "Analisis video ini memerlukan waktu lebih lama dari biasanya, kemungkinan karena durasinya yang panjang. Silakan coba lagi, atau gunakan video yang lebih pendek untuk hasil lebih cepat. Kredit Anda telah dikembalikan." };
  }
  if (raw.includes("invalid JSON") || raw.includes("schema") || raw.includes("Kimi")) {
    return { code: "AI_OUTPUT_INVALID", message: "Sistem AI sedang sibuk menganalisis video panjang dan belum dapat menyelesaikan permintaan ini. Silakan coba lagi sesaat lagi, atau gunakan video yang lebih pendek. Kredit Anda telah dikembalikan." };
  }
  return { code: "UNKNOWN", message: "Terjadi kendala saat memproses video Anda. Silakan coba lagi sesaat lagi. Kredit Anda telah dikembalikan." };
}

export const handleJobFailure = inngest.createFunction(
  {
    id: "handle-job-failure",
    triggers: [{ event: "inngest/function.failed", expression: "event.data.function_id == 'klipin-process-video-clips'" }],
  },
  async ({ event }: { event: { data: { event: { data: { jobId: string; userId: string } }; error: { message?: string } } } }) => {
    const supabase = createServiceRoleClient();
    const { jobId, userId } = event.data.event.data;
    const rawErr = event.data.error?.message || "Unknown error";
    const { code, message } = mapError(rawErr);

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
        error_code: code,
        error_message: message,
        processing_completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    await supabase.rpc("refund_credits", {
      p_user_id: userId,
      p_amount: job.credits_charged,
      p_reference_id: jobId,
      p_description: `Refund: ${code}`,
    });

    return { refunded: job.credits_charged, code };
  }
);
