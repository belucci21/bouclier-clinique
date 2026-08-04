begin;

insert into public.appointment_types (id, name, duration_minutes, price_mxn_minor, is_active)
values ('a3000000-0000-0000-0000-000000000001', 'Catalog assertion type', 30, 10000, false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'appointment_variants'
      and column_name = 'stripe_product_id'
  ) then
    raise exception 'missing stripe_product_id';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'appointment_variants'
      and column_name = 'stripe_deposit_price_id'
  ) then
    raise exception 'missing stripe_deposit_price_id';
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'appointment_variants'
      and indexname = 'appointment_variants_stripe_deposit_price_uidx'
  ) then
    raise exception 'missing unique Stripe Price index';
  end if;

  if (
    select count(*) from pg_constraint
    where conrelid = 'public.appointment_variants'::regclass
      and conname in (
        'appointment_variants_stripe_product_id_format_check',
        'appointment_variants_stripe_deposit_price_id_format_check',
        'appointment_variants_stripe_catalog_pair_check'
      )
      and convalidated
  ) <> 3 then
    raise exception 'missing validated Stripe catalog constraints';
  end if;

  if (
    select count(*) from pg_indexes
    where schemaname = 'public'
      and tablename = 'appointment_variants'
      and indexname in (
        'appointment_variants_active_stripe_product_idx',
        'appointment_variants_stripe_deposit_price_uidx',
        'appointment_variants_active_catalog_missing_idx'
      )
  ) <> 3 then
    raise exception 'missing active Stripe catalog indexes';
  end if;

  if not exists (
    select 1 from pg_class
    where oid = 'public.appointment_variants'::regclass
      and relrowsecurity and relforcerowsecurity
  ) then
    raise exception 'appointment_variants RLS is not forced';
  end if;

  if has_table_privilege('anon', 'public.appointment_variants', 'select')
    or has_table_privilege('authenticated', 'public.appointment_variants', 'insert')
    or has_table_privilege('public', 'public.appointment_variants', 'update') then
    raise exception 'appointment_variants public privileges were not revoked';
  end if;

  if exists (
    select 1 from public.appointment_variants
    where (stripe_product_id is null) <> (stripe_deposit_price_id is null)
  ) then
    raise exception 'Stripe catalog identifier backfill is not paired';
  end if;

  if not has_function_privilege('service_role', 'public.expire_booking_hold(text,text)', 'execute')
    or has_function_privilege('anon', 'public.expire_booking_hold(text,text)', 'execute') then
    raise exception 'expire_booking_hold privileges are not hardened';
  end if;

  if not exists (
    select 1 from pg_class
    where oid = 'public.stripe_catalog_sync_leases'::regclass
      and relrowsecurity and relforcerowsecurity
  ) then
    raise exception 'catalog sync lease RLS is not forced';
  end if;
end;
$$;

do $$
begin
  if not public.acquire_stripe_catalog_sync_lease('lease-token-00000001', 900) then
    raise exception 'first catalog lease acquisition failed';
  end if;
  if public.acquire_stripe_catalog_sync_lease('lease-token-00000002', 900) then
    raise exception 'concurrent catalog lease was accepted';
  end if;
  if not public.renew_stripe_catalog_sync_lease('lease-token-00000001', 900) then
    raise exception 'catalog lease renewal failed';
  end if;
  perform public.release_stripe_catalog_sync_lease('lease-token-00000001');
  if not public.acquire_stripe_catalog_sync_lease('lease-token-00000002', 900) then
    raise exception 'catalog lease recovery after release failed';
  end if;
  perform public.release_stripe_catalog_sync_lease('lease-token-00000002');
end;
$$;

do $$
begin
  begin
    insert into public.appointment_variants (
      id, appointment_type_id, name, price_mxn_minor, duration_minutes,
      is_active, stripe_product_id, stripe_deposit_price_id
    ) select
      'invalid-catalog-pair', id, 'Invalid pair', 10000, 30,
      false, 'prod_1234567890abcdef', null
    from public.appointment_types
    where id = 'a3000000-0000-0000-0000-000000000001';
    raise exception 'paired catalog constraint accepted invalid data';
  exception when check_violation then
    null;
  end;
end;
$$;

rollback;
