begin;

insert into public.appointment_types (id, name, duration_minutes, price_mxn_minor, is_active)
values ('a4000000-0000-0000-0000-000000000001', 'Expiration test', 30, 10000, true);

insert into public.doctors (id, is_active)
values ('d4000000-0000-0000-0000-000000000001', true);

insert into public.appointment_variants (
  id, appointment_type_id, name, price_mxn_minor, duration_minutes, is_active
) values (
  'expiration-test-variant', 'a4000000-0000-0000-0000-000000000001',
  'Expiration test variant', 10000, 30, true
);

insert into public.booking_holds (
  appointment_type_id, appointment_variant_id, doctor_id,
  patient_full_name, patient_email, patient_phone,
  starts_at, ends_at, expires_at, status,
  price_mxn_minor, deposit_rate_bps, deposit_mxn_minor,
  stripe_checkout_session_id
) values (
  'a4000000-0000-0000-0000-000000000001', 'expiration-test-variant',
  'd4000000-0000-0000-0000-000000000001',
  'Expiration patient', 'expiration@example.com', '1',
  now() + interval '1 day', now() + interval '1 day 30 minutes',
  now() + interval '30 minutes', 'checkout_created',
  10000, 3000, 3000, 'cs_expiration_retry'
);

select public.expire_booking_hold('evt_expiration_retry', 'cs_expiration_retry');
select public.expire_booking_hold('evt_expiration_retry', 'cs_expiration_retry');

do $$
begin
  if (
    select status from public.booking_holds
    where stripe_checkout_session_id = 'cs_expiration_retry'
  ) <> 'expired' then
    raise exception 'expire_booking_hold was not idempotent';
  end if;
end;
$$;

rollback;
