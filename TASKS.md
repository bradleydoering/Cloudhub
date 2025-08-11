# TASKS — Bootstrap & Milestones

This file is a working backlog for Claude Code to implement, aligned to the spec.

## M0 — Foundations
- [ ] Create Turborepo with apps (`cloudhub`, `portal`, `api`) and packages (`ui`, `config`, `lib`)
- [ ] Tailwind + design tokens in `packages/ui`; import into apps
- [ ] Supabase schema migrations for Section 6.1 tables
- [ ] RLS scaffolding per Section 6.2 with test roles
- [ ] Auth skeleton (staff + customer magic link UX stubs)
- [ ] File upload flow (signed URLs to R2; server-side signature endpoint only)
- [ ] Env checker + `.env.example` consumption in apps
- [ ] Observability hooks (Sentry init stubs), request ID propagation

## M1 — Intake → Deals
- [ ] `POST /api/intake/web` with hCaptcha + HMAC signature
- [ ] `GET /api/routing/preview` (city → location)
- [ ] Website + design-library intake mapping to Lead+Deal
- [ ] De-dup by email/phone; attach existing Customers
- [ ] Deals list (kanban), Deal detail, participants, address, scope
- [ ] Documents upload to Deal; Notes & Tasks
- [ ] Location switcher UX for staff

## M2 — Convert → Projects
- [ ] Convert Deal → Project (inherit docs/participants/address/location)
- [ ] Projects list/detail; Timeline; Photos grid/upload
- [ ] Customer portal with magic-link auth; visibility controls

## M3 — Change Orders & Invoicing
- [ ] CO create/send/approve flow (with audit trail)
- [ ] Stripe Checkout/Invoices; webhook handler; payment status in UI

## M4 — Agent API & Search
- [ ] `/api/agent/capabilities` and `/api/agent/actions` (scoped; idempotent; rate-limited)
- [ ] Unified search (pgvector) — if deferred, stub action and scope to metadata

## M5 — Admin View-as, QA, Polish
- [ ] Impersonation (Admin view-as user/customer), banner + audit
- [ ] E2E tests (Playwright): lead → routing → portal → approve CO → pay invoice

## Guardrails & Ops (must-have during build)
- [ ] Idempotency-Key on all writes; dedupe store
- [ ] Rate limits by IP + token; 429 with Retry-After
- [ ] Webhooks DLQ & replay endpoint; exponential backoff
- [ ] Virus scan on uploads; file-type allowlist; short TTL signed URLs
- [ ] Backups and exports wiring (stubs ok for v1)
