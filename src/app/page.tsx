import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">Klipin</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-300">
          AI-powered clip finder. Ekstrak hook, momen viral, dan highlight dari video YouTube
          panjang dalam hitungan menit.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold"
          >
            Mulai
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
