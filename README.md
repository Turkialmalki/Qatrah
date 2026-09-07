# منصة قاطرة (Qatrah Platform) — MVP

Next.js + TypeScript + Tailwind CSS + Supabase SaaS for Saudi event/wedding planning — connecting clients with approved halls & service providers through rule-based smart engines (matching, fair pricing, budget optimization, execution planning).

## Stack
- **Next.js 16** (App Router, Server Actions, Turbopack)
- **Supabase** — Postgres, Auth, Row Level Security
- **Tailwind CSS 4**
- **Vercel** — hosting

## Roles
- **Client (عميل)** — creates events, gets smart matches, approves & pays, tracks execution, rates providers.
- **Provider (مقدم خدمة)** — lists halls/services, receives matched requests, quotes prices, manages execution tasks.
- **Admin (الإدارة)** — approves providers, monitors quality, manages settlements & knowledge base.

## The 14 platform modules (from the SOW)
User management, event management, hall management, service management, smart matching engine, design management, pricing, fair pricing engine, budget optimization engine, execution management, smart planning engine, quality, evaluation, knowledge base — all implemented. AI-assisted matching *verification* is intentionally out of scope for v1 (per the proposal); the "smart" engines are transparent, rule-based algorithms in `src/lib/engines/`.

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then in the SQL editor run the full contents of `supabase/schema.sql` once. This creates every table, enum, trigger, and Row Level Security policy.

3. **Environment variables** — copy `.env.local.example` to `.env.local` and fill in from Supabase Project Settings → API:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```

5. **(Optional) Seed demo data** — after creating a few provider accounts through the signup flow and having an admin approve them, use the admin dashboard to review, or run the seed script:
   ```bash
   npm run seed
   ```
   (requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`)

## Creating the first admin

Sign up normally as a client, then in the Supabase Table Editor open `profiles` and change that user's `role` to `admin`. They can then access `/dashboard/admin`.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Add the same three environment variables in Vercel Project Settings → Environment Variables.
4. Deploy.

## Project structure

```
src/
  app/                 routes (App Router)
    (auth)/login, signup
    dashboard/client|provider|admin
    halls, services, knowledge-base, how-it-works   (public)
  components/ui        Button, Card, Input, Badge primitives
  components/layout    Navbar, Footer
  components/dashboard Sidebar shell shared by all 3 roles
  lib/supabase         browser/server/proxy Supabase clients
  lib/engines          matching.ts, pricing.ts, budget.ts, planning.ts — the 4 smart engines
  lib/actions          Server Actions (auth, events, provider, admin)
  lib/types            hand-written DB types
supabase/schema.sql    full DB schema + RLS policies + seed KB articles
```
