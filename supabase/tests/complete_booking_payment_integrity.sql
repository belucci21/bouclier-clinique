begin;

insert into public.appointment_types (id, name, duration_minutes, price_mxn_minor, is_active)
values ('a1000000-0000-0000-0000-000000000001', 'Payment integrity test', 60, 100000, true);

insert into public.doctors (id, is_active)
values ('d1000000-0000-0000-0000-000000000001', true);

insert into public.appointment_variants (
  id, appointment_type_id, name, price_mxn_minor, duration_minutes, is_active
) values (
  'payment-integrity-variant',
  'a1000000-0000-0000-0000-000000000001',
  'Payment integrity variant',
  100000,
  60,
  true
);

do $$
declare
  v_result jsonb;
  v_success_hold uuid;
  v_expired_hold uuid;
  v_conflicted_hold uuid;
  v_success_start timestamptz := date_trunc('hour', now()) + interval '2 days';
  v_expired_start timestamptz := date_trunc('hour', now()) + interval '3 days';
  v_conflict_start timestamptz := date_trunc('hour', now()) + interval '4 days';
begin
  insert into public.booking_holds (
    appointment_type_id, appointment_variant_id, doctor_id,
    patient_full_name, patient_email, patient_phone,
    starts_at, ends_at, expires_at, status,
    price_mxn_minor, deposit_rate_bps, deposit_mxn_minor,
    stripe_checkout_session_id
  ) values (
    'a1000000-0000-0000-0000-000000000001', 'payment-integrity-variant',
    'd1000000-0000-0000-0000-000000000001',
    'Success patient', 'success@example.com', '1',
    v_success_start, v_success_start + interval '60 minutes', now() + interval '30 minutes',
    'checkout_created', 100000, 3000, 30000, 'cs_integrity_success'
  ) returning id into v_success_hold;

  v_result := public.complete_booking_payment(
    'evt_integrity_success', 'cs_integrity_success', 'pi_integrity_success', 30000
  );
  if v_result ->> 'outcome' <> 'scheduled'
    or (v_result ->> 'duplicate')::boolean
    or (select status from public.booking_holds where id = v_success_hold) <> 'paid'
    or (select count(*) from public.appointments where doctor_id = 'd1000000-0000-0000-0000-000000000001' and scheduled_at = v_success_start) <> 1
    or (select count(*) from public.payment_records where booking_hold_id = v_success_hold and status = 'paid') <> 1 then
    raise exception 'successful payment was not scheduled exactly once';
  end if;

  v_result := public.complete_booking_payment(
    'evt_integrity_success', 'cs_integrity_success', 'pi_integrity_success', 30000
  );
  if v_result ->> 'outcome' <> 'scheduled'
    or not (v_result ->> 'duplicate')::boolean
    or (select count(*) from public.appointments where doctor_id = 'd1000000-0000-0000-0000-000000000001' and scheduled_at = v_success_start) <> 1
    or (select count(*) from public.payment_records where booking_hold_id = v_success_hold) <> 1 then
    raise exception 'duplicate payment was not idempotent';
  end if;

  insert into public.booking_holds (
    appointment_type_id, appointment_variant_id, doctor_id,
    patient_full_name, patient_email, patient_phone,
    starts_at, ends_at, expires_at, status,
    price_mxn_minor, deposit_rate_bps, deposit_mxn_minor,
    stripe_checkout_session_id, created_at
  ) values (
    'a1000000-0000-0000-0000-000000000001', 'payment-integrity-variant',
    'd1000000-0000-0000-0000-000000000001',
    'Expired patient', 'expired@example.com', '2',
    v_expired_start, v_expired_start + interval '60 minutes', now() - interval '1 minute',
    'expired', 100000, 3000, 30000, 'cs_integrity_expired', now() - interval '2 minutes'
  ) returning id into v_expired_hold;

  v_result := public.complete_booking_payment(
    'evt_integrity_expired', 'cs_integrity_expired', 'pi_integrity_expired', 30000
  );
  if v_result ->> 'outcome' <> 'manual_review'
    or v_result ->> 'reason' <> 'hold_expired'
    or (select status from public.booking_holds where id = v_expired_hold) <> 'failed'
    or (select scheduling_failure_reason from public.booking_holds where id = v_expired_hold) <> 'hold_expired'
    or (select count(*) from public.payment_records where booking_hold_id = v_expired_hold and status = 'paid') <> 1
    or (select count(*) from public.appointments where doctor_id = 'd1000000-0000-0000-0000-000000000001' and scheduled_at = v_expired_start) <> 0 then
    raise exception 'expired payment did not enter manual review without an appointment';
  end if;

  insert into public.booking_holds (
    appointment_type_id, appointment_variant_id, doctor_id,
    patient_full_name, patient_email, patient_phone,
    starts_at, ends_at, expires_at, status,
    price_mxn_minor, deposit_rate_bps, deposit_mxn_minor,
    stripe_checkout_session_id
  ) values (
    'a1000000-0000-0000-0000-000000000001', 'payment-integrity-variant',
    'd1000000-0000-0000-0000-000000000001',
    'Conflicted patient', 'conflicted@example.com', '3',
    v_conflict_start, v_conflict_start + interval '60 minutes', now() + interval '30 minutes',
    'checkout_created', 100000, 3000, 30000, 'cs_integrity_conflicted'
  ) returning id into v_conflicted_hold;

  insert into public.booking_holds (
    appointment_type_id, appointment_variant_id, doctor_id,
    patient_full_name, patient_email, patient_phone,
    starts_at, ends_at, expires_at, status,
    price_mxn_minor, deposit_rate_bps, deposit_mxn_minor
  ) values (
    'a1000000-0000-0000-0000-000000000001', 'payment-integrity-variant',
    'd1000000-0000-0000-0000-000000000001',
    'Replacement patient', 'replacement@example.com', '4',
    v_conflict_start + interval '30 minutes', v_conflict_start + interval '90 minutes',
    now() + interval '30 minutes', 'active', 100000, 3000, 30000
  );

  v_result := public.complete_booking_payment(
    'evt_integrity_conflicted', 'cs_integrity_conflicted', 'pi_integrity_conflicted', 30000
  );
  if v_result ->> 'outcome' <> 'manual_review'
    or v_result ->> 'reason' <> 'slot_conflict'
    or (select status from public.booking_holds where id = v_conflicted_hold) <> 'failed'
    or (select scheduling_failure_reason from public.booking_holds where id = v_conflicted_hold) <> 'slot_conflict'
    or (select count(*) from public.payment_records where booking_hold_id = v_conflicted_hold and status = 'paid') <> 1
    or (select count(*) from public.appointments where doctor_id = 'd1000000-0000-0000-0000-000000000001' and scheduled_at = v_conflict_start) <> 0 then
    raise exception 'overlapping replacement did not force manual review without an appointment';
  end if;
end;
$$;

rollback;
