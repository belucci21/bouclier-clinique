begin;

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
end;
$$;

rollback;
