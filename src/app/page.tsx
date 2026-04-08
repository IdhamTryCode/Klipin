import Link from "next/link";
import { ArrowRight, Zap, Clock, Sparkles, Video, Wand2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <>
      <Navbar
        rightSlot={
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-6xl px-6 pt-24 pb-20">
        {/* HERO */}
        <section className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-medium text-brand-200">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Kimi K2.5
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05]">
            Temukan momen viral
            <br />
            <span className="text-gradient-brand">dalam hitungan menit</span>
          </h1>

          <p className="text-lg text-fg-muted max-w-xl mx-auto leading-relaxed">
            Klipin menganalisis video YouTube panjang dan mengekstrak hook,
            highlight, serta caption siap pakai—lengkap dengan timestamp akurat.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/login">
              <Button size="lg" className="glow-brand">
                Mulai Gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="glass" size="lg">
                Lihat Fitur
              </Button>
            </Link>
          </div>

          <p className="text-xs text-fg-muted/70">
            3 kredit gratis · Tanpa kartu kredit
          </p>
        </section>

        {/* FEATURES */}
        <section id="features" className="mt-32 grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: Video,
              title: "Paste URL",
              desc: "Dukung video sampai 3 jam. Tinggal paste URL YouTube dan submit.",
            },
            {
              icon: Wand2,
              title: "AI Analisis",
              desc: "Kimi K2.5 baca transcript, cari hook viral, scoring otomatis.",
            },
            {
              icon: Clock,
              title: "Timestamp Akurat",
              desc: "Klik langsung loncat ke detik tepat momen viralnya di YouTube.",
            },
          ].map((f) => (
            <Card
              key={f.title}
              className="hover:border-brand-400/30 transition-colors"
            >
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-brand-500/10 border border-brand-400/20 mb-4">
                <f.icon className="h-5 w-5 text-brand-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-fg-muted leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </section>

        {/* CTA */}
        <section className="mt-32">
          <Card className="text-center py-16 px-8 glass-strong">
            <Zap className="h-10 w-10 text-brand-300 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Siap pangkas waktu editing kamu?
            </h2>
            <p className="text-fg-muted max-w-md mx-auto mb-8">
              Yang biasanya butuh 2 jam buat scrub manual, sekarang cuma 2 menit.
            </p>
            <Link href="/login">
              <Button size="lg" className="glow-brand">
                Coba Sekarang <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </section>

        <footer className="mt-20 text-center text-xs text-fg-muted/60">
          © {new Date().getFullYear()} Klipin · Built with Kimi & Next.js
        </footer>
      </main>
    </>
  );
}
