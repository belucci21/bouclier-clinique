begin;

create table if not exists public.appointment_variants (
  id text primary key,
  appointment_type_id uuid not null references public.appointment_types(id),
  name text not null,
  price_mxn_minor bigint not null check (price_mxn_minor > 0),
  duration_minutes integer not null check (duration_minutes > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointment_variants_type_active_idx
  on public.appointment_variants (appointment_type_id, is_active)
  where is_active;

-- Safe bridge for existing database appointment types. Source catalog variants
-- can be synchronized later without trusting browser-provided prices.
with hold_defaults as (
  select
    appointment_type_id,
    max(price_mxn_minor) as price_mxn_minor,
    max(greatest(1, extract(epoch from (ends_at - starts_at))::integer / 60)) as duration_minutes
  from public.booking_holds
  group by appointment_type_id
)
insert into public.appointment_variants (
  id, appointment_type_id, name, price_mxn_minor, duration_minutes, is_active
)
select
  'legacy-' || appointment_type.id::text,
  appointment_type.id,
  appointment_type.name,
  coalesce(appointment_type.price_mxn_minor, hold_defaults.price_mxn_minor),
  coalesce(appointment_type.duration_minutes, hold_defaults.duration_minutes, 30),
  appointment_type.is_active
from public.appointment_types as appointment_type
left join hold_defaults on hold_defaults.appointment_type_id = appointment_type.id
where coalesce(appointment_type.price_mxn_minor, hold_defaults.price_mxn_minor) > 0
on conflict (id) do update set
  name = excluded.name,
  price_mxn_minor = excluded.price_mxn_minor,
  duration_minutes = excluded.duration_minutes,
  is_active = excluded.is_active,
  updated_at = now();

alter table public.booking_holds
  add column if not exists appointment_variant_id text;

update public.booking_holds as hold
set appointment_variant_id = 'legacy-' || hold.appointment_type_id::text
where hold.appointment_variant_id is null
   or not exists (
     select 1
     from public.appointment_variants as variant
     where variant.id = hold.appointment_variant_id
   );

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.booking_holds'::regclass
      and conname = 'booking_holds_appointment_variant_id_fkey'
  ) then
    alter table public.booking_holds
      add constraint booking_holds_appointment_variant_id_fkey
      foreign key (appointment_variant_id) references public.appointment_variants(id);
  end if;
end;
$$;

alter table public.booking_holds
  alter column appointment_variant_id set not null;

create index if not exists booking_holds_variant_idx
  on public.booking_holds (appointment_variant_id);

alter table public.appointment_variants enable row level security;
alter table public.appointment_variants force row level security;

revoke all on table public.appointment_variants from public, anon, authenticated;

create or replace function public.list_booking_busy_intervals(
  p_doctor_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_now timestamptz
) returns table (
  start_at timestamptz,
  end_at timestamptz,
  source text
)
language sql
stable
security definer
set search_path = ''
as $$
  select blocked.start_at, blocked.end_at, 'blocked_time'::text
  from public.blocked_times as blocked
  where blocked.doctor_id = p_doctor_id
    and blocked.start_at < p_to
    and blocked.end_at > p_from

  union all

  select
    appointment.scheduled_at,
    appointment.scheduled_at + make_interval(mins => greatest(coalesce(appointment.duration_minutes, 30), 1)),
    'appointment'::text
  from public.appointments as appointment
  where appointment.doctor_id = p_doctor_id
    and appointment.status <> 'cancelled'
    and appointment.scheduled_at < p_to
    and appointment.scheduled_at + make_interval(mins => greatest(coalesce(appointment.duration_minutes, 30), 1)) > p_from

  union all

  select hold.starts_at, hold.ends_at, 'hold'::text
  from public.booking_holds as hold
  where hold.doctor_id = p_doctor_id
    and hold.starts_at < p_to
    and hold.ends_at > p_from
    and (
      hold.status = 'paid'
      or (hold.status in ('active', 'checkout_created') and hold.expires_at > p_now)
    );
$$;

create or replace function public.create_booking_hold_atomic(
  p_appointment_type_id uuid,
  p_appointment_variant_id text,
  p_doctor_id uuid,
  p_starts_at timestamptz,
  p_patient_full_name text,
  p_patient_email text,
  p_patient_phone text,
  p_deposit_rate_bps integer default 3000
) returns table (
  id uuid,
  expires_at timestamptz,
  price_mxn_minor bigint,
  duration_minutes integer,
  deposit_mxn_minor bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_variant public.appointment_variants%rowtype;
  v_now timestamptz;
  v_ends_at timestamptz;
  v_expires_at timestamptz;
  v_local_start timestamp;
  v_local_end timestamp;
  v_deposit_mxn_minor bigint;
  v_hold_id uuid;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_doctor_id::text, 0));
  v_now := pg_catalog.clock_timestamp();

  select variant.* into v_variant
  from public.appointment_variants as variant
  join public.appointment_types as appointment_type
    on appointment_type.id = variant.appointment_type_id
   and appointment_type.is_active
  where variant.id = p_appointment_variant_id
    and variant.appointment_type_id = p_appointment_type_id
    and variant.is_active;

  if not found then
    raise exception 'invalid_variant' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.doctors as doctor
    where doctor.id = p_doctor_id and doctor.is_active
  ) then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end if;

  if p_starts_at <= v_now or p_starts_at > v_now + interval '90 days' then
    raise exception 'invalid_slot' using errcode = 'P0001';
  end if;

  v_local_start := p_starts_at at time zone 'America/Mexico_City';
  if extract(second from v_local_start) <> 0
    or mod(extract(minute from v_local_start)::integer, 30) <> 0 then
    raise exception 'invalid_slot' using errcode = 'P0001';
  end if;

  if p_deposit_rate_bps < 0 or p_deposit_rate_bps > 10000 then
    raise exception 'invalid_deposit_rate' using errcode = 'P0001';
  end if;

  if nullif(btrim(p_patient_full_name), '') is null
    or nullif(btrim(p_patient_email), '') is null
    or nullif(btrim(p_patient_phone), '') is null then
    raise exception 'invalid_patient' using errcode = 'P0001';
  end if;

  v_ends_at := p_starts_at + make_interval(mins => v_variant.duration_minutes);
  v_local_end := v_ends_at at time zone 'America/Mexico_City';

  if v_local_start::date <> v_local_end::date
    or not exists (
      select 1
      from public.availability as available
      where available.doctor_id = p_doctor_id
        and available.is_active
        and available.day_of_week = extract(dow from v_local_start)::integer
        and available.start_time <= v_local_start::time
        and available.end_time >= v_local_end::time
    ) then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end if;

  -- Release the exact-start defense-in-depth index from stale holds before insert.
  update public.booking_holds
  set status = 'expired', updated_at = v_now
  where doctor_id = p_doctor_id
    and status in ('active', 'checkout_created')
    and expires_at <= v_now;

  if exists (
    select 1
    from public.list_booking_busy_intervals(p_doctor_id, p_starts_at, v_ends_at, v_now) as busy
    where busy.start_at < v_ends_at and busy.end_at > p_starts_at
  ) then
    raise exception 'slot_conflict' using errcode = 'P0001';
  end if;

  v_expires_at := v_now + interval '30 minutes';
  v_deposit_mxn_minor := round(
    v_variant.price_mxn_minor::numeric * p_deposit_rate_bps::numeric / 10000
  )::bigint;

  insert into public.booking_holds (
    appointment_type_id,
    appointment_variant_id,
    doctor_id,
    patient_full_name,
    patient_email,
    patient_phone,
    starts_at,
    ends_at,
    expires_at,
    price_mxn_minor,
    deposit_rate_bps,
    deposit_mxn_minor
  ) values (
    p_appointment_type_id,
    p_appointment_variant_id,
    p_doctor_id,
    btrim(p_patient_full_name),
    lower(btrim(p_patient_email)),
    btrim(p_patient_phone),
    p_starts_at,
    v_ends_at,
    v_expires_at,
    v_variant.price_mxn_minor,
    p_deposit_rate_bps,
    v_deposit_mxn_minor
  ) returning booking_holds.id into v_hold_id;

  return query select
    v_hold_id,
    v_expires_at,
    v_variant.price_mxn_minor,
    v_variant.duration_minutes,
    v_deposit_mxn_minor;
end;
$$;

revoke all on function public.list_booking_busy_intervals(uuid,timestamptz,timestamptz,timestamptz)
  from public, anon, authenticated;
revoke all on function public.create_booking_hold_atomic(uuid,text,uuid,timestamptz,text,text,text,integer)
  from public, anon, authenticated;

grant execute on function public.list_booking_busy_intervals(uuid,timestamptz,timestamptz,timestamptz)
  to service_role;
grant execute on function public.create_booking_hold_atomic(uuid,text,uuid,timestamptz,text,text,text,integer)
  to service_role;

commit;
