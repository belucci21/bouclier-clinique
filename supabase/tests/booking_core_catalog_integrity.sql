begin;

do $$
declare
  v_missing_rls integer;
begin
  if (select count(*) from public.appointment_types where is_active) <> 15 then
    raise exception 'expected 15 active source appointment types';
  end if;

  if (select count(*) from public.appointment_variants where is_active) <> 21 then
    raise exception 'expected 21 active priced source variants';
  end if;

  if not exists (
    select 1
    from public.doctors as doctor
    join public.profiles as profile on profile.id = doctor.profile_id
    where doctor.id = 'd0000000-0000-4000-8000-000000000001'
      and doctor.is_active
      and profile.full_name = 'Dra. Gissel Castellanos'
  ) then
    raise exception 'seeded Bouclier specialist is missing or unlinked';
  end if;

  if (
    select count(*)
    from public.availability
    where doctor_id = 'd0000000-0000-4000-8000-000000000001'
      and is_active
  ) <> 6 then
    raise exception 'expected six active availability windows';
  end if;

  select count(*) into v_missing_rls
  from pg_class
  where oid in (
    'public.profiles'::regclass,
    'public.doctors'::regclass,
    'public.appointment_types'::regclass,
    'public.availability'::regclass,
    'public.blocked_times'::regclass,
    'public.appointments'::regclass,
    'public.prescriptions'::regclass,
    'public.reports'::regclass,
    'public.booking_holds'::regclass,
    'public.payment_records'::regclass,
    'public.stripe_webhook_events'::regclass,
    'public.appointment_variants'::regclass
  ) and not relrowsecurity;

  if v_missing_rls <> 0 then
    raise exception 'one or more booking/portal tables do not have RLS enabled';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.doctors'::regclass
      and conname = 'doctors_id_fkey'
      and conkey = array[
        (select attnum::smallint from pg_attribute
         where attrelid = 'public.doctors'::regclass and attname = 'profile_id')
      ]
  ) then
    raise exception 'optional doctor profile relationship is missing';
  end if;

  if has_table_privilege('anon', 'public.booking_holds', 'INSERT')
    or has_table_privilege('authenticated', 'public.booking_holds', 'INSERT')
    or has_table_privilege('anon', 'public.payment_records', 'INSERT')
    or has_table_privilege('authenticated', 'public.payment_records', 'INSERT') then
    raise exception 'payment/hold tables expose direct client writes';
  end if;
end;
$$;

rollback;
