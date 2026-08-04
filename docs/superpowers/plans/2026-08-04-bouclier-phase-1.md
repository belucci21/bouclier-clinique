# Bouclier Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the unified Bouclier public website, faithful to the approved design A, with internal clinical treatment content and a server-secured 30% Stripe appointment deposit flow.

**Architecture:** Keep the existing React/Vite frontend and split reusable content, navigation, booking, and design tokens into focused modules. Add a separate Node/Express API deployable on Hostinger; it reads prices and availability from Supabase, creates Stripe Checkout Sessions, verifies webhooks, and never exposes secret credentials to the browser.

**Tech Stack:** React 19, React Router 7, Vite 8, Framer Motion, Vitest, Testing Library, Node 22, Express, Stripe Node SDK, Supabase JS.

## Global Constraints

- Canonical public domain: `bouclier-clinique.com`.
- Do not migrate retail pharmacy, cosmetic products, Shopify cart, stock, quantity, or store checkout.
- Convert Shopify treatment-service content into internal clinical pages without ecommerce controls.
- Approved visual reference: `C:/Users/Usuario/Downloads/Imagen de Codex 4 ago 2026, 01_34_08 p.m..png` at 1440 × 1024.
- Titles use `DrukWide-Medium.woff`; body copy uses Inter/system sans.
- Palette is black, charcoal, graphite, stone gray, light gray, and white; no gold.
- Stripe deposit is 30% of `appointment_types.price_mxn_minor`, calculated server-side in MXN.
- Never commit or log Stripe secret keys, Supabase service credentials, patient health data, or passwords.
- Preserve the existing uncommitted `app.json` changes in both Expo apps.

---

### Task 1: Testing baseline and design foundations

**Files:**
- Modify: `package.json`
- Modify: `src/styles/global.css`
- Create: `src/test/setup.js`
- Create: `src/design/tokens.js`
- Create: `src/design/tokens.test.js`
- Add asset: `public/assets/fonts/DrukWide-Medium.woff`

**Interfaces:**
- Produces: `DESIGN_TOKENS`, CSS custom properties, `@font-face` name `Druk Wide`, and `npm test`.

- [ ] **Step 1: Add Vitest and Testing Library scripts/dependencies**

Add scripts `test: "vitest run"` and `test:watch: "vitest"`, plus `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event` as dev dependencies.

- [ ] **Step 2: Write the failing token test**

```js
import { describe, expect, it } from 'vitest'
import { DESIGN_TOKENS } from './tokens.js'

describe('Bouclier design tokens', () => {
  it('contains no legacy gold and exposes Druk for display text', () => {
    expect(JSON.stringify(DESIGN_TOKENS)).not.toMatch(/b89a5a|d4b97a|9a7d3f/i)
    expect(DESIGN_TOKENS.font.display).toBe("'Druk Wide', sans-serif")
    expect(DESIGN_TOKENS.color.ink).toBe('#111111')
  })
})
```

- [ ] **Step 3: Run the test and verify failure**

Run: `npm test -- src/design/tokens.test.js`
Expected: FAIL because `tokens.js` does not exist.

- [ ] **Step 4: Implement tokens, font loading, reset, focus, and reduced motion**

`tokens.js` exports colors, fonts, spacing, content width, and transitions. `global.css` maps them to CSS custom properties, loads the supplied WOFF, removes all gold variables, sets visible `:focus-visible`, and disables nonessential motion under `prefers-reduced-motion`.

- [ ] **Step 5: Run tests and build**

Run: `npm test -- src/design/tokens.test.js && npm run build`
Expected: PASS; production build succeeds.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/test src/design src/styles/global.css public/assets/fonts/DrukWide-Medium.woff
git commit -m "feat: establish Bouclier monochrome design system"
```

### Task 2: Clinical content model and internal routes

**Files:**
- Create: `src/data/treatments.js`
- Create: `src/data/treatments.test.js`
- Create: `src/pages/Tratamientos.jsx`
- Create: `src/pages/TratamientoDetalle.jsx`
- Create: `src/components/TreatmentCard.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Produces: `TREATMENT_CATEGORIES`, `TREATMENTS`, `getTreatmentBySlug(slug)`, `/tratamientos`, and `/tratamientos/:slug`.

- [ ] **Step 1: Write failing content integrity tests**

Tests assert unique slugs, every item has category/summary/indications/expectations/technology/image, existing `/manchas` and `/blefaroplastia` are represented, and serialized content contains none of `/products/`, `collections`, `carrito`, `stock`, `cantidad`, `farmacia`, or retail prices.

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm test -- src/data/treatments.test.js`
Expected: FAIL because the treatment module does not exist.

- [ ] **Step 3: Implement the clinical treatment registry**

Include Hydrafacial, Diamond Glow, OxyGeneo, Liftage, Exion Facial/Micropunción, Red Touch, Hollywood Peel, Natura Peel, Láser Duoglide, Accent Prime, Endermologie, depilación láser, masajes, manchas/melasma, and blefaroplastia. Use neutral medical copy; do not promise guaranteed outcomes.

- [ ] **Step 4: Implement listing and detail pages**

`Tratamientos.jsx` renders category navigation and accessible cards. `TratamientoDetalle.jsx` resolves the slug, returns an internal not-found state, and presents objective, indication, expectations, technology, FAQs, and an internal booking CTA.

- [ ] **Step 5: Register lazy-loaded routes**

Use `React.lazy` for treatment and secondary marketing routes to reduce the initial bundle.

- [ ] **Step 6: Run tests, lint, and build**

Run: `npm test -- src/data/treatments.test.js && npm run lint && npm run build`
Expected: PASS; no route points to the dermatology domain.

- [ ] **Step 7: Commit**

```bash
git add src/data src/pages/Tratamientos.jsx src/pages/TratamientoDetalle.jsx src/components/TreatmentCard.jsx src/App.jsx
git commit -m "feat: migrate dermatology treatments to internal clinical pages"
```

### Task 3: Unified navigation and approved homepage

**Files:**
- Modify: `src/components/Header.jsx`
- Create: `src/components/TreatmentMegaMenu.jsx`
- Create: `src/components/Header.test.jsx`
- Rewrite: `src/pages/Home.jsx`
- Modify: `src/styles/global.css`
- Add: `public/assets/img/hero-clinical-editorial.webp`

**Interfaces:**
- Consumes: `TREATMENT_CATEGORIES` from Task 2 and design tokens from Task 1.
- Produces: accessible desktop/mobile navigation and the design-A homepage composition.

- [ ] **Step 1: Write failing header tests**

```jsx
render(<MemoryRouter><Header /></MemoryRouter>)
expect(screen.getByRole('link', { name: 'AGENDAR CITA' })).toHaveAttribute('href', '/citas')
expect(screen.getByRole('link', { name: 'TRATAMIENTOS' })).toHaveAttribute('href', '/tratamientos')
expect(screen.queryByText(/farmacia/i)).not.toBeInTheDocument()
```

Add keyboard tests for opening the treatment menu, pressing Escape, and restoring focus.

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- src/components/Header.test.jsx`
Expected: FAIL because the current header contains external treatments and pharmacy.

- [ ] **Step 3: Build the accessible unified header**

Desktop labels are `CLÍNICA`, `TRATAMIENTOS`, `MÉTODO`, `DRA. GISSEL`, `MI PORTAL`, and `AGENDAR CITA`. The mega menu uses a button with `aria-expanded`, closes on Escape/outside click/navigation, and contains only internal categories/treatments. Mobile uses a trapped, scrollable panel with body scroll restored on cleanup.

- [ ] **Step 4: Recreate the approved hero**

At 1440 px use a near 50/50 split, left-aligned Druk headline `MEDICINA ESTÉTICA CON CRITERIO`, supporting copy, black primary button, and underlined secondary action. On mobile, stack copy before the image and keep both CTAs visible without overflow.

- [ ] **Step 5: Rebuild the remainder of the homepage**

Use: treatment introduction/category grid, Método Bouclier, cases/results disclaimer, Dra. Gissel/team, verified proof only, locations, and final CTA. Remove the duplicate testimonials and unsupported claims.

- [ ] **Step 6: Run component tests, lint, and build**

Run: `npm test -- src/components/Header.test.jsx && npm run lint && npm run build`
Expected: PASS and a smaller initial chunk due to lazy routes.

- [ ] **Step 7: Commit**

```bash
git add src/components src/pages/Home.jsx src/styles/global.css public/assets/img/hero-clinical-editorial.webp
git commit -m "feat: implement approved Bouclier editorial homepage"
```

### Task 4: Clinic, doctor, footer, legal, and content consistency

**Files:**
- Create: `src/data/siteContent.js`
- Create: `src/data/siteContent.test.js`
- Modify: `src/pages/QuienesSomos.jsx`
- Create: `src/pages/DraGissel.jsx`
- Create: `src/pages/Contacto.jsx`
- Create: `src/pages/PreguntasFrecuentes.jsx`
- Create: `src/pages/Legal.jsx`
- Modify: `src/components/Footer.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Produces: one source of truth for clinic contact/locations/social links and working secondary routes.

- [ ] **Step 1: Write failing content consistency tests**

Assert there is one canonical phone, email, primary clinic address, real Instagram/Facebook links, and no `href="#"`, generic social homepages, contradictory cities, or test credentials.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/data/siteContent.test.js`
Expected: FAIL against current footer/content.

- [ ] **Step 3: Implement shared content and pages**

Migrate the non-store about/doctor/FAQ/contact/legal content from dermatology, preserving the existing Bouclier method and team content. If approved legal copy is unavailable, omit that route from public navigation; never publish invented legal text.

- [ ] **Step 4: Rebuild the footer**

Remove Twitter and generic links, use the actual dermatology Instagram/Facebook URLs, add internal treatment/legal/contact links, and keep the monochrome system.

- [ ] **Step 5: Run tests, lint, and build**

Run: `npm test -- src/data/siteContent.test.js && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/siteContent* src/pages src/components/Footer.jsx src/App.jsx
git commit -m "feat: unify Bouclier clinic and doctor content"
```

### Task 5: Booking domain, database migration, and frontend API client

**Files:**
- Create: `src/booking/deposit.js`
- Create: `src/booking/deposit.test.js`
- Create: `src/services/bookingApi.js`
- Create: `src/services/bookingApi.test.js`
- Create: `supabase/migrations/202608040001_booking_deposits.sql`

**Interfaces:**
- Produces: `calculateDepositMinor(priceMinor, rateBps = 3000)`, `bookingApi.createHold`, `bookingApi.createCheckoutSession`, `bookingApi.getSession`, and SQL types/constraints.

- [ ] **Step 1: Write failing deposit tests**

```js
expect(calculateDepositMinor(10000)).toBe(3000)
expect(calculateDepositMinor(9999)).toBe(3000)
expect(() => calculateDepositMinor(-1)).toThrow()
expect(() => calculateDepositMinor(100.5)).toThrow()
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/booking/deposit.test.js src/services/bookingApi.test.js`
Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement pure money logic and API client**

Use integer minor units and basis points; round with `Math.round`. The client sends treatment/doctor/slot/patient fields but never an amount. Normalize API errors into `{ code, message, retryable }`.

- [ ] **Step 4: Add the migration**

Add `appointment_types.price_mxn_minor`, booking holds with unique active slot constraint and expiry, and payment records with unique Stripe session/payment intent ids. Add indexes for expiry/status lookups and RLS policies that prevent anonymous direct writes.

- [ ] **Step 5: Run tests and inspect SQL**

Run: `npm test -- src/booking/deposit.test.js src/services/bookingApi.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/booking src/services supabase/migrations
git commit -m "feat: add secure booking deposit domain"
```

### Task 6: Hostinger Node API and Stripe webhooks

**Files:**
- Create: `server/package.json`
- Create: `server/src/app.js`
- Create: `server/src/config.js`
- Create: `server/src/services/bookingService.js`
- Create: `server/src/routes/booking.js`
- Create: `server/src/routes/stripeWebhook.js`
- Create: `server/test/booking.test.js`
- Create: `server/test/webhook.test.js`
- Create: `server/.env.example`

**Interfaces:**
- Consumes: Supabase tables from Task 5.
- Produces: `POST /api/booking/hold`, `POST /api/booking/checkout-session`, `GET /api/booking/session/:id`, `POST /api/stripe/webhook`.

- [ ] **Step 1: Write failing API tests with injected Stripe/Supabase fakes**

Cover: amount is recomputed from Supabase, invalid/expired holds return 409, session metadata contains hold id, webhook signature failure returns 400, repeated `checkout.session.completed` is idempotent, and expired checkout releases the hold.

- [ ] **Step 2: Run and verify failure**

Run: `npm --prefix server test`
Expected: FAIL because the API does not exist.

- [ ] **Step 3: Implement strict environment validation**

Require `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_WEB_URL`, and `PORT`. Refuse startup if a required server secret is missing. `.env.example` contains names only.

- [ ] **Step 4: Implement hold and Checkout Session routes**

Read price/duration/availability on the server, acquire the hold transactionally, calculate 30%, and create a one-time Checkout Session using embedded mode and dynamic payment methods. Use a deterministic idempotency key derived from the hold id.

- [ ] **Step 5: Implement raw-body webhook verification**

Register the webhook route before JSON parsing, verify `Stripe-Signature`, persist the event id, and handle completion/expiration asynchronously and idempotently.

- [ ] **Step 6: Run server tests**

Run: `npm --prefix server test`
Expected: PASS without any live Stripe key.

- [ ] **Step 7: Commit**

```bash
git add server
git commit -m "feat: add Hostinger booking and Stripe API"
```

### Task 7: Unified booking UI with embedded deposit payment

**Files:**
- Rewrite: `src/pages/Citas.jsx`
- Create: `src/booking/BookingFlow.jsx`
- Create: `src/booking/BookingFlow.test.jsx`
- Create: `src/booking/StripeDepositStep.jsx`
- Modify: `src/pages/paciente/AgendarCita.jsx`
- Modify: `package.json`

**Interfaces:**
- Consumes: `bookingApi` from Task 5 and API routes from Task 6.
- Produces: a single reusable four-step booking flow and embedded Stripe payment state.

- [ ] **Step 1: Write failing journey tests**

Mock `bookingApi` and test treatment → doctor → slot → patient details → hold → embedded checkout. Verify the UI displays total/deposit returned by the server, prevents double submission, shows slot-conflict recovery, and never opens a new tab.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/booking/BookingFlow.test.jsx`
Expected: FAIL because the flow does not exist.

- [ ] **Step 3: Implement the reusable booking flow**

Replace duplicated demo logic in public `Citas.jsx`; use real appointment types/availability and explicit loading, empty, error, conflict, and success states. Patient portal reuses the selection core with authenticated patient details.

- [ ] **Step 4: Integrate Stripe.js embedded Checkout**

Load Stripe with `VITE_STRIPE_PUBLISHABLE_KEY`, mount Checkout using the server-created client secret, and show a final server-verified confirmation. Do not persist or inspect card data.

- [ ] **Step 5: Run tests, lint, and build**

Run: `npm test -- src/booking/BookingFlow.test.jsx && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/booking src/pages/Citas.jsx src/pages/paciente/AgendarCita.jsx package.json package-lock.json
git commit -m "feat: integrate appointment deposit checkout"
```

### Task 8: Security cleanup, performance, and full verification

**Files:**
- Modify: `LINKS-SISTEMA.md`
- Modify: `src/App.jsx`
- Modify: `.gitignore`
- Create: `design-qa.md`
- Create: `docs/deployment/hostinger-stripe.md`

**Interfaces:**
- Produces: clean documentation, deploy instructions, passing build/test/lint, and `design-qa.md` with `final result: passed`.

- [ ] **Step 1: Remove exposed credentials and document rotation**

Delete passwords from tracked docs, add `.env*` ignores with `.env.example` exceptions, and document Hostinger/Supabase/Stripe environment setup without values. Rotate the previously shared live Stripe key outside the repository before production use.

- [ ] **Step 2: Run the complete automated suite**

Run: `npm test && npm run lint && npm run build && npm --prefix server test`
Expected: PASS; no secret-like strings in tracked files.

- [ ] **Step 3: Start frontend and API locally with non-live test configuration**

Use mocked Stripe for the journey unless a reauthenticated Stripe connector and rotated test credentials are available.

- [ ] **Step 4: Capture and compare design states**

At 1440 × 1024 compare the approved reference and implementation. Also verify 390, 768, 1024, and 1440 widths; menu open/closed; treatment listing/detail; booking loading/error/conflict/payment-success states.

- [ ] **Step 5: Run design QA and fix P0/P1/P2 findings**

Write `design-qa.md`, repeat comparison after fixes, and stop only when it states `final result: passed`. Record remaining P3 polish separately.

- [ ] **Step 6: Commit final verification**

```bash
git add .
git commit -m "chore: verify Bouclier phase one release"
```
