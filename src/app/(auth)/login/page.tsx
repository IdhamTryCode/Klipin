"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardStrong } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      // If email confirmation is required, session will be null
      if (!data.session) {
        setNotice(
          "Akun dibuat! Kami sudah kirim email konfirmasi ke " +
            email +
            ". Cek inbox kamu untuk verifikasi sebelum login."
        );
        setLoading(false);
        return;
      }
      // Auto-confirm enabled — langsung masuk
      setNotice("Akun berhasil dibuat. Mengarahkan ke dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 800);
      return;
    }

    // Sign in
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (err) {
      setError(
        err.message === "Invalid login credentials"
          ? "Email atau password salah"
          : err.message === "Email not confirmed"
          ? "Email belum dikonfirmasi. Cek inbox kamu."
          : err.message
      );
      setLoading(false);
      return;
    }
    setNotice("Login berhasil! Mengarahkan...");
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 600);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>

        <CardStrong className="p-8 sm:p-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-500 blur-md opacity-60" />
              <Sparkles className="relative h-6 w-6 text-brand-300" />
            </div>
            <span className="text-xl font-bold tracking-tight">Klipin</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-3xl font-bold mt-4 mb-1">
                {mode === "signin" ? "Selamat datang" : "Buat akun"}
              </h1>
              <p className="text-sm text-fg-muted mb-6">
                {mode === "signin"
                  ? "Login untuk lanjut ke dashboard kamu"
                  : "Dapat 3 kredit gratis langsung setelah daftar"}
              </p>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted/60" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@kamu.com"
                disabled={loading}
                className="pl-11"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted/60" />
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password (min 6 karakter)"
                disabled={loading}
                className="pl-11"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-400 px-2"
                >
                  {error}
                </motion.p>
              )}
              {notice && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 rounded-2xl border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-300"
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{notice}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full mt-2 glow-brand"
            >
              {loading
                ? "Memproses..."
                : mode === "signin"
                ? "Login"
                : "Daftar Gratis"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setNotice(null);
            }}
            className="w-full text-center text-sm text-fg-muted hover:text-brand-300 transition-colors mt-6"
          >
            {mode === "signin"
              ? "Belum punya akun? Daftar gratis"
              : "Sudah punya akun? Login"}
          </button>
        </CardStrong>
      </motion.div>
    </main>
  );
}
