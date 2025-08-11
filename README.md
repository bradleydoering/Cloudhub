# CloudHub (CloudReno) — Monorepo

A lightweight renovation CRM + customer project hub. This repo is structured as a **Turborepo** monorepo with three apps:

- **apps/cloudhub** – Staff app (Deals, Projects, Admin)
- **apps/portal** – Customer portal (documents, timeline, CO approvals, invoices)
- **apps/api** – API server (intake endpoints, signed uploads, Stripe webhooks, Agent Actions)

Shared code lives under **packages/** (ui, config, lib). The product spec lives in **/docs/spec-cloudhub-v1.md** and is the source of truth.

## Tech
- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (Auth, Postgres, Realtime, RLS)
- Cloudflare R2 (private object storage via signed URLs)
- Stripe (single account; webhooks on api subdomain)
- Postmark/Resend for email
- pgvector for search (v1.1)
- Sentry for error tracking (optional)

## Monorepo Layout
```
apps/
  cloudhub/   # staff SPA
  portal/     # customer portal
  api/        # API server (Next.js API routes or nest/express later)
packages/
  ui/         # shared components + Tailwind tokens
  config/     # eslint, tsconfig, zod schemas
  lib/        # API client, auth, utilities
docs/
  spec-cloudhub-v1.md
```

## Requirements
- Node 18+ (or 20+)
- pnpm (preferred) or npm
- Turbo (`pnpm dlx turbo --version`)
- Supabase CLI (optional for local DB): https://supabase.com/docs/guides/cli

## Quickstart
```bash
# 1) Clone your repo
git clone <YOUR_GITHUB_REPO_URL> cloudhub
cd cloudhub

# 2) Add this spec + scaffolding files (copy from /docs download you got)
#    or if they are already committed, just pull latest

# 3) Initialize monorepo packages
pnpm install

# 4) Create .env files for each app (copy from .env.example)
cp .env.example apps/cloudhub/.env.local
cp .env.example apps/portal/.env.local
cp .env.example apps/api/.env.local

# 5) Run dev (each in its own terminal)
pnpm --filter @cloudreno/api dev
pnpm --filter @cloudreno/cloudhub dev
pnpm --filter @cloudreno/portal dev
```

> **Tip:** In Vercel, create three projects and point domains:  
> `cloudhub.cloudrenovation.ca` → apps/cloudhub,  
> `portal.cloudrenovation.ca` → apps/portal,  
> `api.cloudrenovation.ca` → apps/api.  
> Add env vars from `.env.example` in each Vercel project (no secrets in git).

## Environment Variables
See **.env.example** for a complete list and where they are set (Vercel, Supabase, Cloudflare).

## Scripts (suggested)
- `pnpm dev` – run all apps locally (turbo pipeline)
- `pnpm build` – build all
- `pnpm lint` – lint monorepo
- `pnpm test` – run tests

## Contributing
- Create a branch per feature: `feature/<short-name>`
- Open a PR; Vercel preview deploys will attach to the PR.
- Keep changes scoped to one app when possible; shared code goes in `packages/`.

## License
TBD (private).

---

**Owner:** Brad · **Spec:** `/docs/spec-cloudhub-v1.md` · **Last updated:** 2025-08-11
