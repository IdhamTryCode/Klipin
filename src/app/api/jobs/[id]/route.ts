import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { data: job, error } = await supabase
    .from("video_jobs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !job)
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const { data: clips } = await supabase
    .from("generated_clips")
    .select("*")
    .eq("job_id", id)
    .order("clip_index");

  return NextResponse.json({ job, clips: clips ?? [] });
}
