begin;

alter table public.booking_holds
  alter column expires_at set default (now() + interval '30 minutes');

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;

revoke all on table public.stripe_webhook_events
  from public, anon, authenticated;

create or replace function public.complete_booking_payment(
  p_stripe_event_id text,
  p_stripe_session_id text,
  p_stripe_payment_intent_id text,
  p_amount_mxn_minor bigint
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hold public.booking_holds%rowtype;
  v_appointment_id uuid;
begin
  select * into v_hold
  from public.booking_holds
  where stripe_checkout_session_id = p_stripe_session_id
  for update;

  if not found then raise exception 'booking hold not found'; end if;

  if v_hold.status = 'paid' then
    select id into v_appointment_id from public.appointments
    where doctor_id = v_hold.doctor_id and scheduled_at = v_hold.starts_at limit 1;
    return v_appointment_id;
  end if;

  if p_amount_mxn_minor <> v_hold.deposit_mxn_minor then raise exception 'payment amount mismatch'; end if;

  insert into public.payment_records (
    booking_hold_id, stripe_event_id, stripe_checkout_session_id,
    stripe_payment_intent_id, amount_mxn_minor, status
  ) values (
    v_hold.id, p_stripe_event_id, p_stripe_session_id,
    p_stripe_payment_intent_id, p_amount_mxn_minor, 'paid'
  ) on conflict (stripe_checkout_session_id) do nothing;

  insert into public.appointments (
    doctor_id, appointment_type_id, scheduled_at, duration_minutes,
    status, location, notes
  ) values (
    v_hold.doctor_id, v_hold.appointment_type_id, v_hold.starts_at,
    extract(epoch from (v_hold.ends_at - v_hold.starts_at))::integer / 60,
    'scheduled', 'Torre EXERTIA, Boca del Río, Veracruz',
    'Anticipo confirmado mediante Stripe'
  ) returning id into v_appointment_id;

  update public.booking_holds set status = 'paid', updated_at = now() where id = v_hold.id;
  return v_appointment_id;
end;
$$;

create or replace function public.expire_booking_hold(
  p_stripe_event_id text,
  p_stripe_session_id text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.booking_holds
  set status = 'expired', updated_at = now()
  where stripe_checkout_session_id = p_stripe_session_id
    and status in ('active', 'checkout_created');

  update public.stripe_webhook_events
  set event_type = event_type
  where stripe_event_id = p_stripe_event_id;
end;
$$;

revoke all on function public.complete_booking_payment(text,text,text,bigint) from public, anon, authenticated;
revoke all on function public.expire_booking_hold(text,text) from public, anon, authenticated;

commit;
