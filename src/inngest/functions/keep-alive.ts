import { inngest } from "../client";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Supabase free tier pauses a project after 7 days of inactivity.
// This runs every 2 days with a trivial read to keep the project active.
export const keepAlive = inngest.createFunction(
  {
    id: "klipin-supabase-keep-alive",
    triggers: [{ cron: "0 0 */2 * *" }],
  },
  async () => {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("video_jobs").select("id").limit(1);
    if (error) throw new Error(`Keep-alive query failed: ${error.message}`);
    return { ok: true };
  }
);
