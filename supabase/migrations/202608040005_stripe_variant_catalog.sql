begin;

alter table public.appointment_variants
  add column if not exists stripe_product_id text,
  add column if not exists stripe_deposit_price_id text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.appointment_variants'::regclass
      and conname = 'appointment_variants_stripe_product_id_format_check'
  ) then
    alter table public.appointment_variants
      add constraint appointment_variants_stripe_product_id_format_check
      check (stripe_product_id is null or stripe_product_id ~ '^prod_[A-Za-z0-9]+$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.appointment_variants'::regclass
      and conname = 'appointment_variants_stripe_deposit_price_id_format_check'
  ) then
    alter table public.appointment_variants
      add constraint appointment_variants_stripe_deposit_price_id_format_check
      check (stripe_deposit_price_id is null or stripe_deposit_price_id ~ '^price_[A-Za-z0-9]+$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.appointment_variants'::regclass
      and conname = 'appointment_variants_stripe_catalog_pair_check'
  ) then
    alter table public.appointment_variants
      add constraint appointment_variants_stripe_catalog_pair_check
      check ((stripe_product_id is null) = (stripe_deposit_price_id is null));
  end if;
end;
$$;

create index if not exists appointment_variants_active_stripe_product_idx
  on public.appointment_variants (stripe_product_id)
  where is_active and stripe_product_id is not null;

create unique index if not exists appointment_variants_stripe_deposit_price_uidx
  on public.appointment_variants (stripe_deposit_price_id)
  where stripe_deposit_price_id is not null;

create index if not exists appointment_variants_active_catalog_missing_idx
  on public.appointment_variants (appointment_type_id)
  where is_active and stripe_deposit_price_id is null;

comment on column public.appointment_variants.stripe_product_id is
  'Server-managed Stripe Product shared by variants of one appointment type.';
comment on column public.appointment_variants.stripe_deposit_price_id is
  'Server-managed immutable Stripe Price for this variant 30% MXN deposit.';

commit;
