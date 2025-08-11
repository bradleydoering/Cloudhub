# CloudHub (CloudReno) — Lightweight CRM Spec v1.0

**Owner:** Brad (CloudReno)  
**Date:** Aug 10, 2025  
**Version:** 1.0 (Foundational build)

---

## 1) Purpose & Goals
CloudHub is a lightweight CRM + project hub tailored for renovation workflows. It turns website/design-library leads into **Deals**, and when won, converts them into **Projects** managed in a shared contractor/customer dashboard.

### Primary goals
- Centralize lead → deal → project lifecycle.
- Support **multi-contact Deals** (e.g., spouses) and a canonical **service address**.
- Store and organize artefacts (contracts, quotes, designs, PDFs, invoices, receipts).
- Convert closed Deals → Projects with a single click and preserve all context.
- Provide a clean **Project Dashboard** for contractors & customers (documents, status, timeline, change orders, photos, invoices, payments via Stripe).
- Permit **role-based** management: sales vs. delivery; allow easy handoff/switching for smaller cities/teams.
- Be **agent-first**: expose consistent, safe, auditable APIs so AI agents can read/write everything on the contractor side.
- Include an **admin/test profile** with view-as (contractor & customer) for QA and iteration.
- Match CloudReno branding (cloudrenovation.ca and /projects).

### Non-goals (v1)
- Detailed scheduling/Gantt with dependencies (basic timeline/milestones only in v1).
- Full accounting (Stripe invoices & payouts only; exporting to bookkeeping later).
- Field service time-tracking (may be added as an integration later).

## 1.1 Deployment & Domain Topology (Subdomain-first)
**Decision:** Host CloudHub as a separate app at **cloudhub.cloudrenovation.ca** with a dedicated **customer portal** at **portal.cloudrenovation.ca** and a public API at **api.cloudrenovation.ca**. The marketing site remains on **cloudrenovation.ca** (including **/packages**). **Note:** `/projects` remains a marketing/design-exploration area only and will **not** proxy or route to the customer portal.

**Why:** Isolation, faster deploys, clearer security boundaries, better caching for the marketing site, and independent scaling.

**Domains**
- **Marketing:** `https://cloudrenovation.ca` (+ `/packages`)
- **Staff (CloudHub):** `https://cloudhub.cloudrenovation.ca`
- **Customer Portal:** `https://portal.cloudrenovation.ca`  
- **Public API:** `https://api.cloudrenovation.ca`
- **Files (R2):** private bucket with signed URLs; optional CDN alias `https://files.cloudrenovation.ca` (no directory listing).

**Flow**
1) Website or /packages form → `POST https://api.cloudrenovation.ca/api/intake/web` (hCaptcha + signed secret).  
2) API creates Lead + Deal, routes owner, sends email notifications.  
3) Sales works in **cloudhub.***; once Deal is Won → Project created.  
4) Customers access **portal.*** via magic link. `/projects` stays separate for top-of-funnel design exploration only.

**SSO/Auth considerations**
- Staff sessions live on **cloudhub.***; customer sessions live on **portal.***.  
- If shared sessions are required later, cookies can be issued for the parent domain (`Domain=.cloudrenovation.ca`) with **SameSite=Lax** and CSRF protections.

## 1.2 Franchise / Location Model & Onboarding
**Concept:** Each franchise branch is a **Location** (e.g., *CloudReno North Vancouver*, *CloudReno Vancouver*). Data is isolated by `location_id` with Admin visibility across all.

**Location essentials**
- **Settings:** public display name, slug, support email/phone, business legal name, tax IDs, billing address, working hours, branding options, default deal stages, notification rules.
- **Territory/routing:** list of cities + optional postal code patterns; used to auto-route leads from the website form’s **city** field.
- **Team:** owner (contractor/PM), sales, PMs, assistants; managed via **memberships** (user ↔ location) with per-location roles.
- **Branding on portal:** show location contact info on customer-facing pages and invoices.

**Onboarding a new branch (Admin)**
1) Create **Location** → enter settings & territory (cities / postal code regex or list).  
2) Invite **Location Owner** and team; assign per-location roles (sales/pm).  
3) Set lead routing (city → location) and test with **/routing/preview**.  
4) (Optional) Configure location-specific invoice footer, tax numbers, and Stripe account (future **Stripe Connect**).

## 2) Users & Roles
- **Lead/Customer:** submits form; later uses the portal for docs, approvals, photos, and payments.
- **Franchise Location Owner (Contractor/PM):** primary operator of a location; manages Deals/Projects for that location and its team.
- **Location Team Member (Sales/PM/Assistant):** scoped to one or more locations via membership; permissions based on role per location.
- **City Manager (Small Markets):** may cover both sales & projects within a single location.
- **Admin (CloudReno HQ):** superuser across all locations; can view-as any staff or customer.
- **AI Agent (Contractor-side):** read/write within the contractor’s allowed locations via scoped tokens.

**Location switching**
- Staff with access to multiple locations get a **location switcher** in the header; queries, lists, and analytics scope to the active location by default.

## 3) Core Objects
- **Organization** (CloudReno Franchise) and **Location** (city/region).
- **User** (staff) & **Role** (Sales, PM, City Manager, Admin).
- **Customer** (contact) with optional household links.
- **Deal** (primary pipeline object) with **DealParticipants** (customers) and **ServiceAddress**.
- **Project** (created from closed/won Deal).
- **Document** (contracts, quotes, designs, invoices, receipts), **Photo** (project images).
- **ChangeOrder**, **Invoice**, **Payment**.
- **Activity** (timeline), **Task** (simple checklist), **Note**.
- **WebhookEvent** (system & Stripe), **AuditLog**.

## 4) High-Level Functional Requirements
### 4.1 Lead Intake & Routing
- Accept leads from website and design-library.  
- De-duplicate by email/phone; attach existing Customers when found.  
- **City-based routing:** Map the lead form’s **city** selection to a **Location** using `locations.routing_rules` (e.g., `{ cities: ["North Vancouver", "West Vancouver"], postal_patterns: ["^V7[ABCD].*"] }`).  
  - If the city maps to **one** location → auto-assign Deal Owner per that location’s rule (round-robin or single owner).  
  - If the city maps to **multiple** locations → assign to **triage** queue for Admin to resolve.  
  - If the city is **unknown** → default to nearest/primary location or triage; log for routing-rules update.  
- Endpoint to verify front-end choices: `GET /api/routing/preview?city=Kitsilano` returns `{location_id, location_name, confidence}` for UX confirmation.

### 4.2 Deals
- Stages (configurable per location; default): `New → Qualified → Estimating → Proposal Sent → Negotiation → Closed Won/Closed Lost`.
- Each Deal has: title, service address, scope description, budget range, priority, expected close date, source (website, design-library, referral, etc.).
- Multi-customer support via **DealParticipants** (flags: `is_primary`, `notify` preferences).
- Artefacts: quotes, designs, PDFs, notes, tasks, activity log.
- Action: **Convert to Project** → create Project with inherited participants, address, documents, and link Invoice/Stripe customer if exists.

### 4.3 Projects (post-conversion)
- Dashboard tabs: **Overview**, **Timeline**, **Documents**, **Change Orders**, **Photos**, **Invoices & Payments**, **Messages** (optional), **Settings**.
- Overview: status (Not Started, In Progress, On Hold, Completed), percent complete, key dates, budget summary.
- Timeline: milestones + progress badges; simple date ranges per phase (demo, rough-in, finishes, punchlist).
- Documents: all Deal docs + Project docs; filters; versioning; permissions (customer-visible vs internal).
- Change Orders: create → customer approves → invoice triggers (partial/full).
- Photos: customer or contractor can upload; auto-date sort; albums per phase.
- Invoices & Payments: Stripe Checkout/Invoices; payment status; receipts stored; Stripe webhooks update state.
- Messages (optional v1): basic threaded notes w/ email notifications (or defer to email-only w/ activity logging in v1).

### 4.4 Permissions & Role Switching
- Sales can view Deals; PMs can view Projects. City Managers have both. Admins can view all.  
- Deals/Projects can be **reassigned** between people/roles quickly.  
- **View-as** mode for Admin/test to impersonate contractor or customer view.

### 4.5 AI Agent–First
- Provide a **capabilities manifest** and **Action API** for safe, granular operations.  
- Agents can: update project status, check status, search documents/photos, submit change orders, upload/retrieve files, list/pay invoice links, add notes/tasks, post timeline updates.  
- **Audit everything** the agent does; rate-limit and require scoped tokens.

### 4.6 Branding & UX
- Use CloudReno’s typography/colors/components.  
- Customer portal visually aligns with **cloudrenovation.ca/projects** but remains on **portal.cloudrenovation.ca** (no routing through `/projects`).  
- Mobile-first for customers; desktop-first for staff.

## 5) Integrations
### 5.1 Static Website Forms → CloudHub
- **Origin:** `cloudrenovation.ca` and `cloudrenovation.ca/packages` (static).  
- **Fields (key):** name, email, phone, **city** (required), address (optional in v1), scope text.  
- **Target:** `POST https://api.cloudrenovation.ca/api/intake/web` (JSON).  
- **Routing:** API maps `city` → `location_id` using `locations.routing_rules`.  
- **Security:** hCaptcha token + HMAC signature header; IP allow-list (Cloudflare egress), rate limit.  
- **CORS:** API allowlist includes `https://cloudrenovation.ca` and `https://cloudrenovation.ca/packages`. Preflight caching (600s).  
- **Response:** 202 + lead/deal id + `location_id` for analytics.
- **Alternative:** Serverless relay (Supabase Edge Function) if you prefer to avoid exposing the API to the public form directly.

### 5.2 Design-Library App → CloudHub
- **Origin:** design-library app domain (e.g., `packages.cloudrenovation.ca` or current host).  
- **Target:** `POST https://api.cloudrenovation.ca/api/intake/designlib`.  
- **Auth:** Static API key + mTLS or IP allow-list.  
- **Payload:** selected package IDs, notes, photos/dimensions (optional), **city** (if collected) to assist routing.  
- **CORS:** add design-library origin to API allowlist.  
- **Result:** Lead + Deal with enriched scope, attach any initial artefacts.

### 5.3 Stripe
- Use `https://api.cloudrenovation.ca/api/stripe/webhook` for all Stripe events; Project/Invoice state updates are pushed via Realtime to staff (cloudhub) and portal.

### 5.4 Storage (Documents/Photos)
- R2 private bucket; uploads via signed URLs requested from API. Optional CDN alias `files.cloudrenovation.ca`. Cookies are **not** used for object access; rely on short-TTL signatures.

### 5.5 Notifications
- Email (Postmark/Resend/SES). SMS optional via Twilio (later WhatsApp for contractors).  
- Notification types: New lead, Deal assignment, Proposal sent, Change order pending/approved, Invoice due/paid, Project status changes.

## 6) Data Model (Relational)
(… full schema and RLS as in the canvas …)

## 7) API Surface
(… endpoints as in the canvas …)

## 8) Agent Actions API
(… capabilities + actions as in the canvas …)

## 9) UX & UI
(… staff app & portal details …)

## 10) Security, Privacy, Compliance
(… as in canvas …)

## 11) Non-Functional + Guardrails & Ops
(… as in canvas …)

## 12) Milestones
(… as in canvas …)

## 13) Testing & Acceptance
(… as in canvas …)

## 14) Analytics & KPIs
(… as in canvas …)

## 15) Rollout & Migration
(… as in canvas …)

## 16) Open Questions
(… as in canvas …)

## 17) Appendices
(… as in canvas …)
