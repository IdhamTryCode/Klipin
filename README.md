# Klipin

AI-powered clip finder untuk content creator. Kasih URL YouTube, dapet daftar momen viral + caption siap pakai dengan timestamp akurat.

Built with Next.js 16, Supabase, Inngest, dan Kimi K2.5.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind v4
- **Supabase** — Auth + Postgres + RLS
- **Inngest** — Background job pipeline (4-step durable execution)
- **Kimi K2.5** (Moonshot AI) — primary, dengan fallback ke `kimi-k2-0905-preview`
- **YouTube Data API v3** — metadata video
- **youtube-transcript / Supadata** — transcript fetching

## Local Development

### Prerequisites
- Node 20+
- pnpm 10+
- Akun Supabase, Moonshot, Google Cloud (YouTube Data API), Inngest

### Setup

1. Clone & install
   ```bash
   git clone https://github.com/<your-user>/klipin.git
   cd klipin
   pnpm install
   ```

2. Copy env template & isi
   ```bash
   cp .env.example .env.local
   ```

3. Apply database schema ke Supabase project kamu — SQL ada di history migration. Atau pakai Supabase CLI / dashboard SQL editor.

4. Jalankan dev server (2 terminal)
   ```bash
   # Terminal 1
   pnpm dev

   # Terminal 2 — Inngest dev server
   pnpm dlx inngest-cli@latest dev -u http://localhost:3000/api/inngest
   ```

5. Buka http://localhost:3000

## Production Deployment

Lihat section "Production Deployment" di bawah.

## License

MIT
