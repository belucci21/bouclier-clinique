begin;

alter table public.appointment_variants
  add column if not exists stripe_product_id text,
  add column if not exists stripe_deposit_price_id text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.appointment_variants'::regclass
      and conname = 'appointment_variants_stripe_product_id_format_check'
  ) then
    alter table public.appointment_variants
      add constraint appointment_variants_stripe_product_id_format_check
      check (stripe_product_id is null or stripe_product_id ~ '^prod_[A-Za-z0-9]+$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.appointment_variants'::regclass
      and conname = 'appointment_variants_stripe_deposit_price_id_format_check'
  ) then
    alter table public.appointment_variants
      add constraint appointment_variants_stripe_deposit_price_id_format_check
      check (stripe_deposit_price_id is null or stripe_deposit_price_id ~ '^price_[A-Za-z0-9]+$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.appointment_variants'::regclass
      and conname = 'appointment_variants_stripe_catalog_pair_check'
  ) then
    alter table public.appointment_variants
      add constraint appointment_variants_stripe_catalog_pair_check
      check ((stripe_product_id is null) = (stripe_deposit_price_id is null));
  end if;
end;
$$;

create index if not exists appointment_variants_active_stripe_product_idx
  on public.appointment_variants (stripe_product_id)
  where is_active and stripe_product_id is not null;

create unique index if not exists appointment_variants_stripe_deposit_price_uidx
  on public.appointment_variants (stripe_deposit_price_id)
  where stripe_deposit_price_id is not null;

create index if not exists appointment_variants_active_catalog_missing_idx
  on public.appointment_variants (appointment_type_id)
  where is_active and stripe_deposit_price_id is null;

comment on column public.appointment_variants.stripe_product_id is
  'Server-managed Stripe Product shared by variants of one appointment type.';
comment on column public.appointment_variants.stripe_deposit_price_id is
  'Server-managed immutable Stripe Price for this variant 30% MXN deposit.';

create table if not exists public.stripe_catalog_sync_leases (
  lease_name text primary key,
  holder_token text not null check (length(holder_token) between 16 and 200),
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.stripe_catalog_sync_leases enable row level security;
alter table public.stripe_catalog_sync_leases force row level security;
revoke all on table public.stripe_catalog_sync_leases from public, anon, authenticated;

create or replace function public.acquire_stripe_catalog_sync_lease(
  p_holder_token text,
  p_ttl_seconds integer default 900
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_acquired boolean;
begin
  if length(p_holder_token) < 16 or p_ttl_seconds < 60 or p_ttl_seconds > 3600 then
    raise exception 'invalid_catalog_sync_lease';
  end if;

  insert into public.stripe_catalog_sync_leases (
    lease_name, holder_token, expires_at, updated_at
  ) values (
    'stripe_catalog', p_holder_token,
    pg_catalog.clock_timestamp() + pg_catalog.make_interval(secs => p_ttl_seconds),
    pg_catalog.clock_timestamp()
  )
  on conflict (lease_name) do update
    set holder_token = excluded.holder_token,
        expires_at = excluded.expires_at,
        updated_at = excluded.updated_at
    where public.stripe_catalog_sync_leases.expires_at <= pg_catalog.clock_timestamp()
       or public.stripe_catalog_sync_leases.holder_token = excluded.holder_token
  returning true into v_acquired;

  return coalesce(v_acquired, false);
end;
$$;

create or replace function public.renew_stripe_catalog_sync_lease(
  p_holder_token text,
  p_ttl_seconds integer default 900
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_renewed boolean;
begin
  update public.stripe_catalog_sync_leases
  set expires_at = pg_catalog.clock_timestamp() + pg_catalog.make_interval(secs => p_ttl_seconds),
      updated_at = pg_catalog.clock_timestamp()
  where lease_name = 'stripe_catalog'
    and holder_token = p_holder_token
    and expires_at > pg_catalog.clock_timestamp()
  returning true into v_renewed;
  return coalesce(v_renewed, false);
end;
$$;

create or replace function public.release_stripe_catalog_sync_lease(
  p_holder_token text
) returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.stripe_catalog_sync_leases
  where lease_name = 'stripe_catalog' and holder_token = p_holder_token;
$$;

create or replace function public.expire_booking_hold(
  p_stripe_event_id text,
  p_stripe_session_id text
) returns void
language sql
security definer
set search_path = ''
as $$
  update public.booking_holds
  set status = 'expired', updated_at = pg_catalog.clock_timestamp()
  where stripe_checkout_session_id = p_stripe_session_id
    and status in ('active', 'checkout_created');
$$;

revoke all on function public.acquire_stripe_catalog_sync_lease(text,integer)
  from public, anon, authenticated;
revoke all on function public.renew_stripe_catalog_sync_lease(text,integer)
  from public, anon, authenticated;
revoke all on function public.release_stripe_catalog_sync_lease(text)
  from public, anon, authenticated;
revoke all on function public.expire_booking_hold(text,text)
  from public, anon, authenticated;

grant execute on function public.acquire_stripe_catalog_sync_lease(text,integer)
  to service_role;
grant execute on function public.renew_stripe_catalog_sync_lease(text,integer)
  to service_role;
grant execute on function public.release_stripe_catalog_sync_lease(text)
  to service_role;
grant execute on function public.expire_booking_hold(text,text)
  to service_role;

commit;
