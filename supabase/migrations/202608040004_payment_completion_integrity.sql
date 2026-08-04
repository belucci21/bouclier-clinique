begin;

alter table public.booking_holds
  add column if not exists scheduling_failure_reason text;

drop function if exists public.complete_booking_payment(text,text,text,bigint);

create function public.complete_booking_payment(
  p_stripe_event_id text,
  p_stripe_session_id text,
  p_stripe_payment_intent_id text,
  p_amount_mxn_minor bigint
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_doctor_id uuid;
  v_hold public.booking_holds%rowtype;
  v_now timestamptz;
  v_appointment_id uuid;
  v_reason text;
  v_payment_exists boolean;
begin
  select hold.doctor_id into v_doctor_id
  from public.booking_holds as hold
  where hold.stripe_checkout_session_id = p_stripe_session_id;

  if not found then
    raise exception 'booking_hold_not_found' using errcode = 'P0001';
  end if;

  -- Use the same lock key/order as hold creation, then re-read under a row lock.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_doctor_id::text, 0));
  v_now := pg_catalog.clock_timestamp();

  select hold.* into v_hold
  from public.booking_holds as hold
  where hold.stripe_checkout_session_id = p_stripe_session_id
  for update;

  if not found then
    raise exception 'booking_hold_not_found' using errcode = 'P0001';
  end if;

  select exists (
    select 1
    from public.payment_records as payment
    where payment.stripe_checkout_session_id = p_stripe_session_id
  ) into v_payment_exists;

  if v_payment_exists then
    if v_hold.status = 'paid' then
      select appointment.id into v_appointment_id
      from public.appointments as appointment
      where appointment.doctor_id = v_hold.doctor_id
        and appointment.scheduled_at = v_hold.starts_at
        and appointment.status <> 'cancelled'
      order by appointment.id
      limit 1;

      return pg_catalog.jsonb_build_object(
        'outcome', 'scheduled',
        'appointment_id', v_appointment_id,
        'hold_id', v_hold.id,
        'reason', null,
        'duplicate', true
      );
    end if;

    return pg_catalog.jsonb_build_object(
      'outcome', 'manual_review',
      'appointment_id', null,
      'hold_id', v_hold.id,
      'reason', coalesce(v_hold.scheduling_failure_reason, 'hold_not_schedulable'),
      'duplicate', true
    );
  end if;

  insert into public.payment_records (
    booking_hold_id,
    stripe_event_id,
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    amount_mxn_minor,
    status
  ) values (
    v_hold.id,
    p_stripe_event_id,
    p_stripe_session_id,
    p_stripe_payment_intent_id,
    p_amount_mxn_minor,
    'paid'
  );

  if p_amount_mxn_minor <> v_hold.deposit_mxn_minor then
    v_reason := 'payment_amount_mismatch';
  elsif v_hold.expires_at <= v_now then
    v_reason := 'hold_expired';
  elsif v_hold.status <> 'checkout_created' then
    v_reason := 'hold_not_schedulable';
  elsif exists (
    select 1
    from public.blocked_times as blocked
    where blocked.doctor_id = v_hold.doctor_id
      and blocked.start_at < v_hold.ends_at
      and blocked.end_at > v_hold.starts_at
  ) or exists (
    select 1
    from public.appointments as appointment
    where appointment.doctor_id = v_hold.doctor_id
      and appointment.status <> 'cancelled'
      and appointment.scheduled_at < v_hold.ends_at
      and appointment.scheduled_at
        + pg_catalog.make_interval(mins => greatest(coalesce(appointment.duration_minutes, 30), 1))
        > v_hold.starts_at
  ) or exists (
    select 1
    from public.booking_holds as other_hold
    where other_hold.doctor_id = v_hold.doctor_id
      and other_hold.id <> v_hold.id
      and other_hold.starts_at < v_hold.ends_at
      and other_hold.ends_at > v_hold.starts_at
      and (
        other_hold.status = 'paid'
        or (
          other_hold.status in ('active', 'checkout_created')
          and other_hold.expires_at > v_now
        )
      )
  ) then
    v_reason := 'slot_conflict';
  end if;

  if v_reason is not null then
    update public.booking_holds
    set status = 'failed', scheduling_failure_reason = v_reason, updated_at = v_now
    where id = v_hold.id;

    return pg_catalog.jsonb_build_object(
      'outcome', 'manual_review',
      'appointment_id', null,
      'hold_id', v_hold.id,
      'reason', v_reason,
      'duplicate', false
    );
  end if;

  insert into public.appointments (
    doctor_id,
    appointment_type_id,
    scheduled_at,
    duration_minutes,
    status,
    location,
    notes
  ) values (
    v_hold.doctor_id,
    v_hold.appointment_type_id,
    v_hold.starts_at,
    extract(epoch from (v_hold.ends_at - v_hold.starts_at))::integer / 60,
    'scheduled',
    'Torre EXERTIA, Boca del RÃ­o, Veracruz',
    'Anticipo confirmado mediante Stripe'
  ) returning id into v_appointment_id;

  update public.booking_holds
  set status = 'paid', scheduling_failure_reason = null, updated_at = v_now
  where id = v_hold.id;

  return pg_catalog.jsonb_build_object(
    'outcome', 'scheduled',
    'appointment_id', v_appointment_id,
    'hold_id', v_hold.id,
    'reason', null,
    'duplicate', false
  );
end;
$$;

revoke all on function public.complete_booking_payment(text,text,text,bigint)
  from public, anon, authenticated;
grant execute on function public.complete_booking_payment(text,text,text,bigint)
  to service_role;

commit;
