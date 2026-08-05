begin;

revoke all on function public.handle_new_user_profile()
  from public, anon, authenticated;

drop policy if exists blocked_times_deny_clients on public.blocked_times;
create policy blocked_times_deny_clients on public.blocked_times
  as restrictive for all to anon, authenticated using (false) with check (false);

drop policy if exists booking_holds_deny_clients on public.booking_holds;
create policy booking_holds_deny_clients on public.booking_holds
  as restrictive for all to anon, authenticated using (false) with check (false);

drop policy if exists payment_records_deny_clients on public.payment_records;
create policy payment_records_deny_clients on public.payment_records
  as restrictive for all to anon, authenticated using (false) with check (false);

drop policy if exists stripe_webhook_events_deny_clients on public.stripe_webhook_events;
create policy stripe_webhook_events_deny_clients on public.stripe_webhook_events
  as restrictive for all to anon, authenticated using (false) with check (false);

drop policy if exists appointment_variants_deny_clients on public.appointment_variants;
create policy appointment_variants_deny_clients on public.appointment_variants
  as restrictive for all to anon, authenticated using (false) with check (false);

drop policy if exists stripe_catalog_sync_leases_deny_clients on public.stripe_catalog_sync_leases;
create policy stripe_catalog_sync_leases_deny_clients on public.stripe_catalog_sync_leases
  as restrictive for all to anon, authenticated using (false) with check (false);

alter policy profiles_select_self_or_active_doctor on public.profiles
  using (
    id = (select auth.uid()) or exists (
      select 1 from public.doctors where doctors.profile_id = profiles.id and doctors.is_active
    )
  );
alter policy profiles_update_self on public.profiles
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
alter policy appointments_read_own on public.appointments
  using (patient_id = (select auth.uid()));
alter policy prescriptions_read_own on public.prescriptions
  using (patient_id = (select auth.uid()));
alter policy reports_read_own on public.reports
  using (patient_id = (select auth.uid()));

create index if not exists doctors_profile_idx
  on public.doctors (profile_id) where profile_id is not null;
create index if not exists appointments_type_id_idx
  on public.appointments (type_id);
create index if not exists booking_holds_appointment_type_idx
  on public.booking_holds (appointment_type_id);
create index if not exists prescriptions_doctor_idx
  on public.prescriptions (doctor_id);
create index if not exists prescriptions_appointment_idx
  on public.prescriptions (appointment_id) where appointment_id is not null;
create index if not exists reports_doctor_idx
  on public.reports (doctor_id);
create index if not exists reports_appointment_idx
  on public.reports (appointment_id) where appointment_id is not null;

commit;