begin;

alter table public.appointment_types
  add column if not exists price_mxn_minor bigint;

alter table public.appointment_types
  drop constraint if exists appointment_types_price_mxn_minor_positive;

alter table public.appointment_types
  add constraint appointment_types_price_mxn_minor_positive
  check (price_mxn_minor is null or price_mxn_minor > 0);

create table if not exists public.booking_holds (
  id uuid primary key default gen_random_uuid(),
  appointment_type_id uuid not null references public.appointment_types(id),
  doctor_id uuid not null references public.doctors(id),
  patient_user_id uuid references auth.users(id),
  patient_full_name text not null,
  patient_email text not null,
  patient_phone text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  status text not null default 'active'
    check (status in ('active', 'checkout_created', 'paid', 'expired', 'cancelled', 'failed')),
  price_mxn_minor bigint not null check (price_mxn_minor > 0),
  deposit_rate_bps integer not null default 3000 check (deposit_rate_bps between 0 and 10000),
  deposit_mxn_minor bigint not null check (deposit_mxn_minor > 0),
  stripe_checkout_session_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (expires_at > created_at)
);

create unique index if not exists booking_holds_unique_live_slot
  on public.booking_holds (doctor_id, starts_at)
  where status in ('active', 'checkout_created', 'paid');

create index if not exists booking_holds_expiry_status_idx
  on public.booking_holds (status, expires_at);

create index if not exists booking_holds_patient_user_idx
  on public.booking_holds (patient_user_id, created_at desc)
  where patient_user_id is not null;

create table if not exists public.payment_records (
  id uuid primary key default gen_random_uuid(),
  booking_hold_id uuid not null references public.booking_holds(id),
  stripe_event_id text unique,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  amount_mxn_minor bigint not null check (amount_mxn_minor > 0),
  currency text not null default 'mxn' check (currency = 'mxn'),
  status text not null check (status in ('pending', 'paid', 'failed', 'refunded', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_records_hold_status_idx
  on public.payment_records (booking_hold_id, status);

alter table public.booking_holds enable row level security;
alter table public.payment_records enable row level security;

revoke all on table public.booking_holds, public.payment_records
  from public, anon, authenticated;

-- No anonymous or authenticated write policies are defined intentionally.
-- These tables are mutated only by the Hostinger API using the service role.

commit;
