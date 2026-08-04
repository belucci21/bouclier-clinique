# Task 2 report — resilient booking calendar and live availability

## Status

Implemented and committed. The five-step booking flow now stays usable when the API is unavailable, uses the Task 1 canonical treatment registry for local treatment/variant choices and URL preselection, renders the approved monochrome calendar interaction, fetches monthly live availability when possible, and completes through a fully prefilled WhatsApp message when online payments are disabled or the API cannot return JSON.

Rendered browser QA is intentionally left to the controller, per the task instruction. Automated interaction coverage, full suites, lint, and production build are complete.

## Commits

- `6e0200daddb432015e9d87dd695e97b749963ce3` — `feat: restore resilient booking calendar`
- The report itself is committed separately after the implementation commit.

## Files

### Frontend

- `src/booking/BookingFlow.jsx` — five-step state orchestration, registry/API merge, query preselection, online/offline completion, conflict recovery, WhatsApp payload.
- `src/booking/BookingCalendar.jsx` — accessible month, day, and time controls.
- `src/booking/BookingSummary.jsx` — persistent appointment summary.
- `src/booking/bookingCalendar.js` — Mexico City date/time formatting, 90-day navigation rules, day grouping, and local fallback slots.
- `src/services/bookingApi.js` — JSON contract enforcement, monthly availability request, and `variantId` hold payload.
- `src/styles/global.css` — approved monochrome progress, calendar, summary, payment fallback, and responsive presentation.
- `src/booking/BookingFlow.test.jsx`, `src/services/bookingApi.test.js` — focused behavior coverage.

### Server

- `server/src/routes/booking.js` — monthly availability endpoint.
- `server/src/services/bookingService.js` — options shape, 90-day range, 30-minute slot generation in `America/Mexico_City`, overlap subtraction, variant-aware holds, and normalized conflicts.
- `server/src/services/supabaseBookingStore.js` — server-only reads from `availability`, `blocked_times`, `appointments`, and unexpired live `booking_holds`.
- `server/test/booking.test.js` — options, overlap filtering, variant hold, conflict, and existing payment behavior.

No migrations, Stripe catalog sync, or browser-side Supabase/service-role access were added.

## RED evidence

Tests were written before production changes and run against the existing implementation.

- Frontend command: `npm test -- src/services/bookingApi.test.js src/booking/BookingFlow.test.jsx`
  - Expected RED: 2 files failed; 8 tests failed, 2 passed.
  - Observed causes: `variantId` dropped, successful `text/html` accepted, `getAvailability` absent, no query variant state, no month calendar/navigation, and API failure removed the flow instead of retaining it.
- Server command: `npm test -- test/booking.test.js`
  - Expected RED: 1 file failed; 4 tests failed, 2 passed.
  - Observed causes: old options path still generated hard-coded slots, availability route returned 404, variant was dropped, and overlap conflict escaped as HTTP 500.

## GREEN evidence

- Focused frontend: `npm test -- src/services/bookingApi.test.js src/booking/BookingFlow.test.jsx` — 2 files, 10/10 tests passed.
- Focused server: `npm test -- test/booking.test.js` — 1 file, 6/6 tests passed.
- Full frontend: `npm test` — 16 files, 53/53 tests passed.
- Full server: `npm test` in `server/` — 2 files, 8/8 tests passed.
- Lint: `npm run lint` — exit 0, no diagnostics.
- Build: `npm run build` — exit 0; Vite transformed 2,286 modules and produced the production bundle.
- Whitespace check: `git diff --check` — exit 0 (Git emitted only the repository's existing LF→CRLF conversion notices).

## API shapes

### `GET /api/booking/options`

```json
{
  "appointmentTypes": [
    {
      "id": "type-id",
      "name": "Treatment name",
      "description": "Description",
      "durationMinutes": 60,
      "variants": [
        {
          "id": "variant-id",
          "name": "Variant name",
          "priceMxnMinor": 180000,
          "active": true
        }
      ]
    }
  ],
  "doctors": [
    { "id": "doctor-id", "name": "Dra. Gissel Castellanos", "specialty": "Dermatología" }
  ],
  "paymentsEnabled": false
}
```

Until Task 3 adds `appointment_variants`, the Supabase adapter represents each database appointment type as one temporary same-ID variant. The frontend merges matching API types over the full Task 1 local registry, preserving canonical treatment/variant choices and URL selection.

### `GET /api/booking/availability`

Query: `doctorId`, `appointmentTypeId`, `variantId`, `month=YYYY-MM`.

```json
{
  "month": "2026-08",
  "timeZone": "America/Mexico_City",
  "intervalMinutes": 30,
  "slots": [
    {
      "startsAt": "2026-08-05T20:00:00.000Z",
      "endsAt": "2026-08-05T21:00:00.000Z"
    }
  ]
}
```

The service expands active recurring `availability` windows at 30-minute starts, uses the stored appointment duration, limits results to 90 days, and removes any slot satisfying `slotStart < busyEnd && slotEnd > busyStart` against blocked times, non-cancelled appointments, and unexpired holds in `active`, `checkout_created`, or `paid` states.

### `POST /api/booking/hold`

```json
{
  "appointmentTypeId": "type-id",
  "variantId": "variant-id",
  "doctorId": "doctor-id",
  "startsAt": "2026-08-05T20:00:00.000Z",
  "patient": {
    "fullName": "Ana Pérez",
    "email": "ana@example.com",
    "phone": "+522291234567"
  }
}
```

Browser-supplied monetary values remain discarded. Existing server-side appointment type price/deposit calculation remains authoritative.

## Fallback behavior

- A successful response whose `Content-Type` is not JSON throws an exposed client error with `code: "api_unavailable"`, `retryable: true`, and the response status.
- The flow renders immediately from `TREATMENTS`; `?tratamiento=<slug>&variante=<id>` preselects matching local entries before the API settles.
- API option failures retain all five steps, the canonical treatment/variant registry, the Bouclier doctor fallback, and a 90-day local clinic-hours calendar.
- Availability failure switches the current selection to local slots and disables online payment without discarding progress.
- Step 5 always exists. With `paymentsEnabled: false` or API failure it shows **Pago online próximamente** and a WhatsApp URL containing treatment, variant, specialist, Mexico City date/time, patient name, phone, and email.
- A `slot_conflict` keeps patient data and provides **Elegir otro horario**, returning to the calendar with the prior treatment/specialist intact.

## Self-review

- Confirmed `BookingFlow` delegates calendar arithmetic/rendering and summary rendering to focused modules rather than absorbing them.
- Confirmed API JSON validation occurs before accepting any 2xx payload, including production-like `200 text/html` responses.
- Confirmed no Supabase credentials or service-role operations moved into browser code.
- Confirmed slot and conflict comparisons use half-open overlap logic, so adjacent intervals remain valid while partial overlaps are rejected.
- Confirmed expired holds are excluded and busy data is filtered by doctor and month/interval.
- Confirmed month controls stop after the month containing day 90 and cannot navigate before the current month.
- Confirmed fallback completion does not attempt a hold or Checkout Session.
- Confirmed no database migration or Stripe catalog work crossed into Task 2.

## Concerns / follow-up

- Task 3 still must add the real `appointment_variants` schema/catalog mapping. Until then, API-backed appointment types expose a compatibility variant while the browser's canonical registry supplies the real source variants.
- The current database unique index protects identical live start times. The server now preflights arbitrary interval overlaps, but two concurrent requests with different overlapping start times still require a transactional database exclusion/RPC strategy for absolute race safety; this belongs with the migration work in Task 3.
- Appointment overlap retrieval includes starts from 24 hours before the requested range, which safely covers the clinic's current sub-day appointment durations. If multi-day appointments are introduced, the schema/query should expose an indexed appointment end timestamp.
- Rendered responsive/visual QA against the approved image remains for the controller as directed.

## Fix round 1

Review findings about hold integrity, interval races, appointment overlap lookup, and variant authority are addressed in `202608040003_booking_integrity.sql` and the server booking layer.

- `POST /api/booking/hold` now rejects starts outside the rolling 90-day window, starts not aligned to a 30-minute Mexico City boundary, inactive doctors, and intervals that do not fit an active availability window.
- Appointment type/variant identity, active state, duration, and price are read from `appointment_variants`; unknown, mismatched, and inactive variants are rejected. The browser cannot set money or duration, and the response uses the values returned by the database.
- `create_booking_hold_atomic` takes a transaction-scoped advisory lock per doctor, revalidates every bookability invariant, checks half-open interval overlap, computes price/deposit/expiry in the database, and inserts the hold in the same transaction. Its exact exception messages are mapped from PostgreSQL `P0001` responses to booking error codes by the Supabase store.
- `list_booking_busy_intervals` uses true interval-overlap predicates for blocked time, appointments, and live holds; it has no fixed appointment lookback.
- The migration adds the minimal variant table and `booking_holds.appointment_variant_id`, creates safe compatibility variants for existing types, repairs null or orphan hold references before applying the FK and NOT NULL constraints, and grants both security-definer RPCs only to `service_role`.

### Fix-round RED evidence

Before the production changes, `npm test -- test/booking.test.js test/supabaseBookingStore.test.js` failed with 9 failures and 6 passes. The failures covered misaligned/out-of-availability/out-of-range holds, unknown/mismatched/inactive variants, authoritative variant price/duration, and the two missing RPC-backed store paths.

### Fix-round GREEN evidence

- Focused server: `npm test -- test/booking.test.js test/supabaseBookingStore.test.js` â€” 2 files, 16/16 tests passed after adding direct RPC exception mapping coverage.
- Disposable PostgreSQL 15 validation: migrations 001â€“003 applied; migration 003 reapplied successfully; compatibility seeding remained at one row; `anon` and `authenticated` lacked RPC execution while `service_role` had it; a multi-day appointment beginning ten days before the query was returned by true overlap; two concurrent differently-started overlapping holds produced one insert and one `slot_conflict`.

### Corrected follow-up boundary

The earlier concerns assigning variant schema, atomic overlap protection, and unbounded appointment overlap lookup to Task 3 are superseded by this fix round. Task 3 still owns real source-catalog synchronization and Stripe catalog/payment enablement. Hostinger and Stripe catalog configuration remain untouched.

### Final bounded verification

- Focused server: `npm test -- test/booking.test.js test/supabaseBookingStore.test.js` â€” 2 files, 16/16 tests passed.
- Full server: `npm test` in `server/` â€” 3 files, 18/18 tests passed.
- Full frontend: `npm test` â€” 17 files, 63/63 tests passed.
- Lint: `npm run lint` â€” exit 0, no diagnostics.
- Build: `npm run build` â€” exit 0; Vite transformed 2,286 modules and produced the production bundle.
- Whitespace: `git diff --check` â€” exit 0 (only LF-to-CRLF conversion warnings).
- Migration self-review additionally expires stale `active`/`checkout_created` holds under the doctor advisory lock before the overlap check and insert, so the legacy exact-start unique index cannot make an expired hold block a reusable slot.
