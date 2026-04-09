import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SubmitVideoForm from "@/components/SubmitVideoForm";
import Navbar from "@/components/Navbar";
import { Card, CardStrong } from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";
import DashboardAnimations from "@/components/DashboardAnimations";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_balance, tier, display_name, email")
    .eq("id", user!.id)
    .single();

  const { data: jobs } = await supabase
    .from("video_jobs")
    .select("id, video_title, status, created_at, credits_charged, video_duration_seconds")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <>
      <Navbar
        rightSlot={
          <>
            <span className="text-xs text-fg-muted hidden sm:inline">
              {profile?.email}
            </span>
            <LogoutButton />
          </>
        }
      />

      <main className="mx-auto w-full max-w-6xl px-6 pt-12 pb-20">
        <DashboardAnimations>
          {/* HEADER */}
          <div data-anim className="mb-8">
            <p className="text-sm text-fg-muted">
              Halo, {profile?.display_name?.split("@")[0] || "creator"} 👋
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-1">
              Dashboard
            </h1>
          </div>

          {/* STATS GRID */}
          <div data-anim className="grid sm:grid-cols-3 gap-4 mb-8">
            <CardStrong className="relative overflow-hidden">
              <div className="absolute -right-8 -top-8 h-32 w-32 bg-brand-500/20 rounded-full blur-2xl" />
              <p className="text-xs uppercase tracking-wider text-fg-muted relative">
                Saldo Kredit
              </p>
              <p className="text-5xl font-bold mt-2 text-gradient-brand relative">
                {profile?.credits_balance ?? 0}
              </p>
              <a
                href={`https://wa.me/6281329064923?text=${encodeURIComponent(
                  `Halo, aku mau isi credit Klipin.\n\nEmail akun: ${profile?.email ?? ""}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
              >
                + Isi Kredit via WhatsApp →
              </a>
            </CardStrong>

            <Card>
              <p className="text-xs uppercase tracking-wider text-fg-muted">
                Tier
              </p>
              <p className="text-3xl font-bold mt-2 capitalize">
                {profile?.tier ?? "free"}
              </p>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-wider text-fg-muted">
                Total Job
              </p>
              <p className="text-3xl font-bold mt-2">{jobs?.length ?? 0}</p>
            </Card>
          </div>

          {/* SUBMIT FORM */}
          <div data-anim className="mb-10">
            <SubmitVideoForm />
          </div>

          {/* JOBS LIST */}
          <div data-anim>
            <h2 className="text-xl font-semibold mb-4">Riwayat Job</h2>
            {!jobs?.length ? (
              <Card className="text-center py-12">
                <p className="text-fg-muted">
                  Belum ada job. Submit video pertamamu di atas! ✨
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {jobs.map((j) => (
                  <Link key={j.id} href={`/dashboard/jobs/${j.id}`}>
                    <Card className="flex items-center justify-between gap-4 hover:border-brand-400/30 hover:bg-white/[0.02] transition-all py-4 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {j.video_title || "(loading...)"}
                        </p>
                        <p className="text-xs text-fg-muted mt-1">
                          {new Date(j.created_at).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}{" "}
                          · {j.credits_charged} kredit
                          {j.video_duration_seconds
                            ? ` · ${Math.round(j.video_duration_seconds / 60)}m`
                            : ""}
                        </p>
                      </div>
                      <StatusBadge status={j.status} />
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </DashboardAnimations>
      </main>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
    processing: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    success: "bg-green-500/10 text-green-300 border-green-500/20",
    failed: "bg-red-500/10 text-red-300 border-red-500/20",
    cancelled: "bg-neutral-500/10 text-neutral-300 border-neutral-500/20",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${
        styles[status] || ""
      } shrink-0`}
    >
      {status}
    </span>
  );
}
