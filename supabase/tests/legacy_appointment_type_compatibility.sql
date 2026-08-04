begin;

do $$
begin
  if (
    select count(*) from information_schema.columns
    where table_schema = 'public'
      and table_name = 'appointments'
      and column_name in ('type_id', 'appointment_type_id')
      and is_nullable = 'NO'
  ) <> 2 then
    raise exception 'appointment type compatibility columns are missing or nullable';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.appointments'::regclass
      and conname = 'appointments_appointment_type_id_fkey'
  ) then
    raise exception 'canonical appointment type foreign key is missing';
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and tablename = 'appointments'
      and indexname = 'appointments_appointment_type_id_idx'
  ) then
    raise exception 'canonical appointment type index is missing';
  end if;
end;
$$;

insert into public.appointment_types (id, name, duration_minutes, price_mxn_minor, is_active)
values
  ('a2000000-0000-0000-0000-000000000001', 'Legacy type one', 30, 10000, true),
  ('a2000000-0000-0000-0000-000000000002', 'Legacy type two', 30, 10000, true);

insert into public.doctors (id, is_active)
values ('d2000000-0000-0000-0000-000000000001', true);

insert into public.appointments (
  doctor_id, type_id, scheduled_at, duration_minutes, status
) values (
  'd2000000-0000-0000-0000-000000000001',
  'a2000000-0000-0000-0000-000000000001',
  now() + interval '1 day', 30, 'scheduled'
);

insert into public.appointments (
  doctor_id, appointment_type_id, scheduled_at, duration_minutes, status
) values (
  'd2000000-0000-0000-0000-000000000001',
  'a2000000-0000-0000-0000-000000000002',
  now() + interval '2 days', 30, 'scheduled'
);

do $$
begin
  if exists (
    select 1 from public.appointments where type_id <> appointment_type_id
  ) then
    raise exception 'appointment type compatibility trigger did not synchronize inserts';
  end if;
end;
$$;

update public.appointments
set type_id = 'a2000000-0000-0000-0000-000000000002'
where scheduled_at::date = (now() + interval '1 day')::date;

do $$
begin
  if exists (
    select 1 from public.appointments where type_id <> appointment_type_id
  ) then
    raise exception 'appointment type compatibility trigger did not synchronize updates';
  end if;
end;
$$;

rollback;
