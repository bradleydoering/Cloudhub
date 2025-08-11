# CloudHub - CloudReno CRM Platform

CloudHub is a lightweight CRM + project hub tailored for renovation workflows. It turns website/design-library leads into Deals, and when won, converts them into Projects managed in a shared contractor/customer dashboard.

## Architecture

This is a monorepo using **npm workspaces** and Turborepo with three apps:

- **apps/cloudhub** – Staff app (Deals, Projects, Admin) - http://localhost:3000
- **apps/portal** – Customer portal (documents, timeline, CO approvals, invoices) - http://localhost:3001
- **apps/api** – API server (intake endpoints, signed uploads, Stripe webhooks, Agent Actions) - http://localhost:3002

Shared code lives under **packages/** (ui, config, lib). The product spec lives in **/docs/spec-cloudhub-v1.md** and is the source of truth.

## Technology Stack
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, Supabase (PostgreSQL + Auth + Realtime)
- **Storage:** Cloudflare R2 with signed URLs
- **Payments:** Stripe
- **Email:** Postmark/Resend
- **Build:** Turborepo, npm workspaces

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

## Development Commands

### Initial setup
```bash
npm install
```

### Development (run all apps)
```bash
npm run dev
```

### Run individual apps
```bash
# API server
npm run dev -w @cloudreno/api

# Staff app (CloudHub)  
npm run dev -w @cloudreno/cloudhub

# Customer portal
npm run dev -w @cloudreno/portal
```

### Build and test
```bash
npm run build
npm run lint  
npm run typecheck
npm run format
```

## Environment Setup

1. Copy `.env.example` to `.env` and configure your environment variables
2. Set up your Supabase project and add the connection details
3. Configure Stripe, R2, and email service credentials

## Deployment

The platform uses a subdomain-first approach:
- Staff app: `https://cloudhub.cloudrenovation.ca`
- Customer portal: `https://portal.cloudrenovation.ca`
- API: `https://api.cloudrenovation.ca`
- Files: `https://files.cloudrenovation.ca` (R2 + CDN)

## Documentation

See `/docs/spec-cloudhub-v1.md` for the complete specification and requirements.
