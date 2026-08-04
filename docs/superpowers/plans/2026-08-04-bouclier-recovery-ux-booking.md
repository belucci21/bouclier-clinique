# Bouclier Recovery UX, Booking and Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the approved monochrome Bouclier experience, faithfully import the treatment catalog without the store, recover the visual booking calendar with a resilient WhatsApp fallback, and prepare Supabase and Stripe deposits for safe Hostinger deployment.

**Architecture:** Keep the React/Vite SPA and the separate Express API. Treatment content is a local canonical registry; booking reads live availability from Supabase through the API, while the frontend keeps a local catalog fallback. Payments are feature-flagged and use Stripe Checkout Sessions with a 30% server-validated deposit.

**Tech Stack:** React 19, React Router 7, Vite 8, Vitest, Express, Supabase/Postgres, Stripe Checkout Sessions, CSS, Druk Wide.

## Global Constraints

- Brand is **Bouclier Dermatología**; palette is true white, cool gray, graphite, and black with no gold.
- Match the four approved visual concepts in the current Codex conversation and use `DrukWide-Medium.woff` for display titles.
- Copy the 15 treatment services and active variants from `https://bouclier-dermatologia.com/collections/tratamientos-cabina/products.json?limit=250`; never copy pharmacy, store, cart, or physical products.
- Keep existing clinical protocols in a separate **Dermatología clínica y protocolos** group.
- Never generate before/after results. Only the six real local case assets may appear in the results section.
- Every treatment cover must be unique. Source services use their source imagery; missing local protocols use unique medically appropriate editorial imagery.
- Missing or zero prices display **Cotizar en valoración**.
- Payment policy is a 30% deposit calculated and validated by the server. Production payments stay disabled until rotated live credentials and Hostinger API/webhook verification exist.
- When the API is unavailable or returns non-JSON, `/citas` must remain usable and finish via a prefilled WhatsApp message.
- Booking timezone is `America/Mexico_City`, slot interval is 30 minutes, and calendar range is 90 days.
- Use TDD: each behavior starts with a failing test, then minimal implementation, then a passing run.

---

### Task 1: Visual system, canonical treatments, unique media, and real results

**Files:**
- Modify: `src/data/treatments.js`, `src/pages/Tratamientos.jsx`, `src/pages/TratamientoDetalle.jsx`, `src/pages/Home.jsx`, `src/components/Footer.jsx`, `src/styles/global.css`
- Add: focused registry/result tests and project assets under `public/assets/`

**Interfaces:**
- Produce `TREATMENTS`, `SOURCE_TREATMENTS`, `CLINICAL_PROTOCOLS`, `TREATMENT_CATEGORIES`, and `getTreatmentBySlug(slug)`.
- Each treatment exposes `slug`, `source`, `category`, `name`, exact content, `cover`, `gallery`, `bookingMode`, `durationMinutes`, and `variants[]` with `id`, `name`, `priceMxnMinor`, `active`.

- [ ] Add failing tests for 15 source treatments, separated extras, active prices, quote states, unique covers, six real result assets, no commerce copy, and treatment CTA query parameters.
- [ ] Add the Druk font asset and container-safe typography tokens; fix footer contrast and all known long-heading overflow.
- [ ] Replace the existing registry with exact source treatment content and variants while preserving clinical extras separately.
- [ ] Download and optimize source treatment imagery; generate only missing editorial covers and persist them in the worktree.
- [ ] Implement the approved directory/detail/result/footer designs and keep all controls code-native and accessible.
- [ ] Run focused tests, full frontend tests, lint, build, and responsive visual QA before committing.

### Task 2: Resilient five-step calendar and live availability API

**Files:**
- Modify: `src/booking/BookingFlow.jsx`, `src/services/bookingApi.js`, booking styles/tests, and the Express booking route/service/store.
- Add: focused calendar helpers/components and API tests as needed.

**Interfaces:**
- `GET /api/booking/options` returns appointment types with variants, doctors, and `paymentsEnabled`.
- `GET /api/booking/availability?doctorId=&appointmentTypeId=&variantId=&month=YYYY-MM` returns real available slots.
- `POST /api/booking/hold` accepts `appointmentTypeId`, `variantId`, `doctorId`, `startsAt`, and patient data.

- [ ] Add failing tests for non-JSON API responses, query preselection, 90-day month navigation, slot selection, real availability filtering, and WhatsApp fallback.
- [ ] Make `bookingApi` reject non-JSON success responses with `api_unavailable`.
- [ ] Restore the approved five-step calendar with treatment/variant selection, specialist, month/day/time, patient summary, and persistent progress.
- [ ] Keep the calendar rendered during API failure using the local registry and finish with a prefilled WhatsApp URL.
- [ ] Replace hard-coded API hours with Supabase `availability`, `blocked_times`, appointments, and live holds using overlap-safe slot calculations.
- [ ] Run focused frontend/server tests, full suites, lint, build, and interaction QA before committing.

### Task 3: Supabase migrations, Stripe catalog/deposits, Hostinger readiness, and release

**Files:**
- Add: one idempotent Supabase migration after `202608040002`, Stripe catalog sync script/tests, and Hostinger routing/deployment documentation/configuration.
- Modify: server config, booking store/service/webhook, `.env.example`, and deployment documentation.

**Interfaces:**
- Add `appointment_variants`, `booking_holds.appointment_variant_id`, Stripe product/price identifiers, and compatibility for legacy `appointments.type_id`.
- Add `GET /api/health` and `PAYMENTS_ENABLED`.
- Checkout uses Stripe Checkout Sessions; signed webhooks handle completion and expiration idempotently.

- [ ] Add failing migration/service tests for variant pricing, 30% deposits, payment flag behavior, health JSON, webhook replay, and expired holds.
- [ ] Implement the idempotent schema migration with RLS, least privilege, foreign-key/filter indexes, and temporary legacy-column synchronization.
- [ ] Add a server-only Stripe catalog sync that creates/updates Products and deposit Prices for active variants and stores IDs in Supabase; never expose secret keys.
- [ ] Validate Stripe price amounts against the server-calculated deposit before Checkout and keep live payments disabled by default.
- [ ] Verify Supabase project `tmcxgiqmmjpgxqrivbod`, apply migrations only after schema inspection, and configure Hostinger `/api/*` routing plus webhook secrets outside Git.
- [ ] Run all tests, lint, build, visual/browser QA, and a security diff review; commit and push the reviewed branch, merge to `master`, push `master`, and verify production routes.
