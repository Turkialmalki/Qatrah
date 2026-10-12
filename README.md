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

## Two event tracks

The platform splits event creation into two flows, chosen at `/dashboard/client/events/new`:

- **أفراح ومناسبات اجتماعية** (`/new/social`) — weddings, engagements, graduations, birthdays. Covers hall, catering, decor, photography, music and planning.
- **فعاليات ومؤتمرات** (`/new/conference`) — conferences, exhibitions, forums, workshops, corporate events and festivals. Adds an agenda panel (days, sessions, speakers, booths, registration desk) stored in `conference_details`, and the conference-only service categories: `av`, `translation`, `booths`, `security`, `transport`.

Each track gets its own execution timeline in `src/lib/engines/planning.ts` — the conference plan works backward from 90 days out, the social one from 60.

## Ready-made service packages

`src/lib/catalog/packages.ts` holds the platform's ready-made packages, grouped by category and tier (أساسية / قياسية / متميزة). They are the backbone of two rules:

1. A provider **adopts a package** in one click — title, description and inclusions come from the catalogue, and only the price is theirs to set. The adopted key is stored on `services.package_key`.
2. A provider who **does not** adopt a package must upload a photo and write a description of at least 80 characters. This is enforced in `createServiceAction` *and* by the `services_custom_requires_media` check constraint, so it holds even if the action is bypassed.

Public category pages at `/services/[category]` show the packages alongside the providers' own listings.

## Providers offer multiple services

`provider_profiles.categories` is an array of every category a provider serves; `category` remains the primary one used for display. Providers manage the list at `/dashboard/provider/profile`, and every selected category becomes available when adding services. Matching keys on each *service's* own category, so one provider competes independently in each category they serve.

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then in the SQL editor run the full contents of `supabase/schema.sql` once. This creates every table, enum, trigger, Row Level Security policy, and the public `service-images` Storage bucket used for provider uploads.

   For an existing project created before the packages/conferences work, run `supabase/migrations/0002_packages_conferences_multicategory.sql` instead — **in two steps**, since Postgres will not let a new enum label be used in the transaction that created it. Run the `0002a` block (the `alter type … add value` statements) on its own first, then the `0002b` block.

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
    halls, halls/[id], services, services/[category], providers, providers/[id],
    events, knowledge-base, how-it-works, about, contact, terms, privacy   (public)
  components/ui        Button, Card, Input, Badge, Stat, EmptyState, PackageCard, ImageField
  components/layout    Navbar (+ mobile sheet), Footer, PageHero, legal shell
  components/dashboard Shell + role-aware nav (sidebar on desktop, drawer on mobile)
  lib/supabase         browser/server/proxy Supabase clients
  lib/engines          matching.ts, pricing.ts, budget.ts, planning.ts — the 4 smart engines
  lib/catalog          packages.ts — the ready-made service package catalogue
  lib/actions          Server Actions (auth, events, provider, admin, profile, design)
  lib/storage.ts       uploads to the public service-images bucket
  lib/types            hand-written DB types
supabase/schema.sql    full DB schema + RLS policies + storage bucket + seed KB articles
supabase/migrations/   incremental migrations for existing projects
```
