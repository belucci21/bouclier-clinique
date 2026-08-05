begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key,
  full_name text not null default '',
  phone text,
  role text not null default 'patient' check (role in ('patient', 'doctor', 'admin')),
  date_of_birth date,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid constraint doctors_id_fkey references public.profiles(id) on delete set null,
  specialty text not null default 'Dermatología',
  license_number text,
  bio text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointment_types (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  description text,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  price numeric(12,2),
  color text not null default '#111111',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (end_time > start_time),
  unique (doctor_id, day_of_week, start_time, end_time)
);

create table if not exists public.blocked_times (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.profiles(id) on delete set null,
  doctor_id uuid not null references public.doctors(id),
  type_id uuid not null references public.appointment_types(id),
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  location text,
  notes text,
  chief_complaint text,
  qr_code text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id),
  appointment_id uuid references public.appointments(id) on delete set null,
  diagnosis text,
  medications text,
  notes text,
  file_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id),
  appointment_id uuid references public.appointments(id) on delete set null,
  title text,
  description text,
  file_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists availability_doctor_day_active_idx
  on public.availability (doctor_id, day_of_week) where is_active;
create index if not exists blocked_times_doctor_range_idx
  on public.blocked_times (doctor_id, start_at, end_at);
create index if not exists appointments_doctor_schedule_idx
  on public.appointments (doctor_id, scheduled_at);
create index if not exists appointments_patient_schedule_idx
  on public.appointments (patient_id, scheduled_at desc) where patient_id is not null;
create index if not exists prescriptions_patient_created_idx
  on public.prescriptions (patient_id, created_at desc);
create index if not exists reports_patient_created_idx
  on public.reports (patient_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.doctors enable row level security;
alter table public.appointment_types enable row level security;
alter table public.availability enable row level security;
alter table public.blocked_times enable row level security;
alter table public.appointments enable row level security;
alter table public.prescriptions enable row level security;
alter table public.reports enable row level security;

drop policy if exists profiles_select_self_or_active_doctor on public.profiles;
create policy profiles_select_self_or_active_doctor on public.profiles for select
  to authenticated using (
    id = auth.uid() or exists (
      select 1 from public.doctors where doctors.profile_id = profiles.id and doctors.is_active
    )
  );
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists doctors_read_active on public.doctors;
create policy doctors_read_active on public.doctors for select
  to anon, authenticated using (is_active);
drop policy if exists appointment_types_read_active on public.appointment_types;
create policy appointment_types_read_active on public.appointment_types for select
  to anon, authenticated using (is_active);
drop policy if exists availability_read_active on public.availability;
create policy availability_read_active on public.availability for select
  to anon, authenticated using (is_active);
drop policy if exists appointments_read_own on public.appointments;
create policy appointments_read_own on public.appointments for select
  to authenticated using (patient_id = auth.uid());
drop policy if exists prescriptions_read_own on public.prescriptions;
create policy prescriptions_read_own on public.prescriptions for select
  to authenticated using (patient_id = auth.uid());
drop policy if exists reports_read_own on public.reports;
create policy reports_read_own on public.reports for select
  to authenticated using (patient_id = auth.uid());

grant select on public.doctors, public.appointment_types, public.availability to anon, authenticated;
grant select, update (full_name, phone, date_of_birth, avatar_url) on public.profiles to authenticated;
grant select on public.appointments, public.prescriptions, public.reports to authenticated;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    case when new.raw_user_meta_data ->> 'role' in ('patient', 'doctor', 'admin')
      then new.raw_user_meta_data ->> 'role' else 'patient' end
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

commit;
