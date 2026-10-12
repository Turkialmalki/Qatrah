# منصة قاطرة (Qatrah Platform) — MVP

Next.js + TypeScript + Tailwind CSS SaaS for Saudi event, wedding and conference planning — connecting clients with approved halls & service providers through rule-based smart engines (matching, fair pricing, budget optimization, execution planning).

## Stack
- **Next.js 16** (App Router, Server Actions, Turbopack)
- **Tailwind CSS 4**
- **Vercel** — hosting
- **No database.** The app runs in demo mode against a seeded in-memory store — see [Demo mode](#demo-mode).

## Demo mode

There is no external database, nothing to sign up for, and **no environment variables to set**. `npm run dev` just works, and so does a fresh deploy.

The whole dataset lives in `src/lib/demo/`:

| File | Role |
|---|---|
| `seed.ts` | The dataset — accounts, providers, halls, services, two live events, bookings, payments, tasks, designs, evaluations, settlements, knowledge base |
| `store.ts` | The in-memory store, held on `globalThis` for the lifetime of the server instance |
| `query.ts` | A small PostgREST-shaped query engine (`.select` with embedded relations, `.eq/.neq/.in`, `.order`, `.limit`, `.single`, `.insert/.update/.delete`, `count`) |
| `client.ts` | The data client: `.from()`, `.auth`, `.storage` |
| `session.ts` | HMAC-signed session cookie |
| `password.ts` | scrypt password hashing |

Pages and server actions import `createClient` from `@/lib/db/server` and were written against that query surface, so changing the backend required no changes to any page.

### What this means in practice

- **Reads are always correct.** The seed is deterministic, so every server instance starts from identical data.
- **Writes are instance-local and temporary.** Adding a service, creating an event or uploading an image mutates memory only. It is lost on restart or redeploy, and on a multi-instance host a later request may land on an instance that never saw it. That is the accepted trade-off for having no database.
- **Uploaded images** are held in memory and served by `/api/demo-image/<bucket>/<path>`, so they disappear along with the rest of a session's writes.

Do not put real user data behind this. When durable, shared storage is needed, the Postgres schema this app was originally built on is still in `supabase/` (`schema.sql` plus the migrations) and matches the demo store's shape table-for-table.

## Demo accounts

Password for every account: **`Qatrah@Demo2026`**

| Role | Email | What it shows |
|---|---|---|
| Client | `client@qatrah.demo` | A wedding mid-execution and a conference at the matching stage |
| Client | `client2@qatrah.demo` | A graduation event still in planning |
| Admin | `admin@qatrah.demo` | Approvals queue, quality flags, bookings, settlements |
| Provider | `hall-riyadh@qatrah.demo` | Three halls, one released settlement |
| Provider | `catering-riyadh@qatrah.demo` | Three catering packages |
| Provider | `decor-riyadh@qatrah.demo` | **Multi-category** — decor, planning and photography, plus a custom listing |
| Provider | `photo-riyadh@qatrah.demo` | Photography packages |
| Provider | `av-riyadh@qatrah.demo` | **Conference specialist** — AV, interpretation, exhibition stands |
| Provider | `logistics-riyadh@qatrah.demo` | Security and transport |
| Provider | `pending@qatrah.demo` | Awaiting admin approval — the gated provider state |

## Roles
- **Client (عميل)** — creates events, gets smart matches, approves & pays, tracks execution, rates providers.
- **Provider (مقدم خدمة)** — lists halls/services, receives matched requests, quotes prices, manages execution tasks.
- **Admin (الإدارة)** — approves providers, monitors quality, manages settlements & knowledge base.

## The 14 platform modules (from the SOW)
User management, event management, hall management, service management, smart matching engine, design management, pricing, fair pricing engine, budget optimization engine, execution management, smart planning engine, quality, evaluation, knowledge base — all implemented. AI-assisted matching *verification* is intentionally out of scope for v1 (per the proposal); the "smart" engines are transparent, rule-based algorithms in `src/lib/engines/`.

## Two event tracks

Event creation splits into two flows, chosen at `/dashboard/client/events/new`:

- **أفراح ومناسبات اجتماعية** (`/new/social`) — weddings, engagements, graduations, birthdays. Covers hall, catering, decor, photography, music and planning.
- **فعاليات ومؤتمرات** (`/new/conference`) — conferences, exhibitions, forums, workshops, corporate events and festivals. Adds an agenda panel (days, sessions, speakers, booths, registration desk) stored in `conference_details`, and the conference-only service categories: `av`, `translation`, `booths`, `security`, `transport`.

Each track has its own execution timeline in `src/lib/engines/planning.ts` — the conference plan works backward from 90 days out, the social one from 60.

## Ready-made service packages

`src/lib/catalog/packages.ts` holds the platform's ready-made packages, grouped by category and tier (أساسية / قياسية / متميزة). They are the backbone of two rules:

1. A provider **adopts a package** in one click — title, description and inclusions come from the catalogue, and only the price is theirs to set. The adopted key is stored on `services.package_key`.
2. A provider who **does not** adopt a package must upload a photo and write a description of at least 80 characters, enforced in `createServiceAction`. (The Postgres schema in `supabase/` additionally enforces it with the `services_custom_requires_media` check constraint, for whenever that backend is used again.)

Public category pages at `/services/[category]` show the packages alongside the providers' own listings.

## Providers offer multiple services

`provider_profiles.categories` lists every category a provider serves; `category` remains the primary one used for display. Providers manage the list at `/dashboard/provider/profile`, and every selected category becomes available when adding services. Matching keys on each *service's* own category, so one provider competes independently in each category they serve.

## Local setup

```bash
npm install
npm run dev
```

That is all — no `.env.local` required. Open http://localhost:3000 and sign in with any account above.

## Deploying to Vercel

1. Push to GitHub.
2. Import the repo in Vercel.
3. Deploy. No environment variables needed.

## Project structure

```
src/
  app/                 routes (App Router)
    (auth)/login, signup
    dashboard/client|provider|admin
    halls, halls/[id], services, services/[category], providers, providers/[id],
    events, knowledge-base, how-it-works, about, contact, terms, privacy   (public)
    api/demo-image/    serves images uploaded during a session
  components/ui        Button, Card, Input, Badge, Stat, EmptyState, PackageCard, ImageField
  components/layout    Navbar (+ mobile sheet), Footer, PageHero, legal shell
  components/dashboard Shell + role-aware nav (sidebar on desktop, drawer on mobile)
  lib/db/server.ts     createClient() — the data access entry point
  lib/demo/            the in-memory backend: seed, store, query engine, auth, session
  lib/engines          matching.ts, pricing.ts, budget.ts, planning.ts — the 4 smart engines
  lib/catalog          packages.ts — the ready-made service package catalogue
  lib/actions          Server Actions (auth, events, provider, admin, profile, design)
  lib/storage.ts       image uploads
  lib/types            hand-written data types
supabase/              Postgres schema + migrations, kept for a future move off demo mode
```
