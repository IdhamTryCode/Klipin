import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SubmitVideoForm from "@/components/SubmitVideoForm";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_balance, tier, display_name")
    .eq("id", user!.id)
    .single();

  const { data: jobs } = await supabase
    .from("video_jobs")
    .select("id, video_title, status, created_at, credits_charged")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Klipin Dashboard</h1>
          <p className="text-sm text-neutral-500">Halo, {profile?.display_name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{profile?.credits_balance}</p>
          <p className="text-xs uppercase text-neutral-500">kredit · {profile?.tier}</p>
        </div>
      </header>

      <SubmitVideoForm />

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Riwayat Job</h2>
        {!jobs?.length ? (
          <p className="text-sm text-neutral-500">Belum ada job. Submit video di atas.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {jobs.map((j) => (
              <li key={j.id}>
                <Link
                  href={`/dashboard/jobs/${j.id}`}
                  className="flex justify-between items-center p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{j.video_title || "(no title)"}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(j.created_at).toLocaleString("id-ID")} · {j.credits_charged} kredit
                    </p>
                  </div>
                  <StatusBadge status={j.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-neutral-100 text-neutral-800",
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || ""}`}>
      {status}
    </span>
  );
}
