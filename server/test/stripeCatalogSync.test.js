import { describe, expect, it, vi } from 'vitest'
import { syncStripeCatalog } from '../src/services/stripeCatalogSync.js'

function catalogFixture(initialVariants, { pageSize = 100 } = {}) {
  const variants = structuredClone(initialVariants)
  const products = new Map()
  const prices = new Map()
  let productSequence = 0
  let priceSequence = 0

  function page(collection, { starting_after: startingAfter } = {}) {
    const ordered = [...collection.values()].sort((left, right) => left.id.localeCompare(right.id))
    const start = startingAfter ? ordered.findIndex(({ id }) => id === startingAfter) + 1 : 0
    const data = ordered.slice(start, start + pageSize)
    return { data, has_more: start + data.length < ordered.length }
  }

  const stripe = {
    products: {
      list: vi.fn(async (input) => page(products, input)),
      create: vi.fn(async (input) => {
        const product = { id: `prod_${++productSequence}`, active: true, ...input }
        products.set(product.id, product)
        return product
      }),
      retrieve: vi.fn(async (id) => {
        const product = products.get(id)
        if (!product) throw new Error('resource_missing')
        return product
      }),
      update: vi.fn(async (id, input) => {
        const product = { ...products.get(id), ...input }
        products.set(id, product)
        return product
      }),
    },
    prices: {
      list: vi.fn(async (input) => page(prices, input)),
      create: vi.fn(async (input) => {
        const price = { id: `price_${++priceSequence}`, active: true, type: 'one_time', ...input }
        prices.set(price.id, price)
        return price
      }),
      retrieve: vi.fn(async (id) => {
        const price = prices.get(id)
        if (!price) throw new Error('resource_missing')
        return price
      }),
      update: vi.fn(async (id, input) => {
        const price = { ...prices.get(id), ...input }
        prices.set(id, price)
        return price
      }),
    },
  }
  const store = {
    acquireCatalogSyncLease: vi.fn().mockResolvedValue(true),
    renewCatalogSyncLease: vi.fn().mockResolvedValue(true),
    releaseCatalogSyncLease: vi.fn().mockResolvedValue(undefined),
    listCatalogVariants: vi.fn(async () => structuredClone(variants).map((variant) => ({
      isActive: true,
      appointmentTypeActive: true,
      ...variant,
    }))),
    listActiveCatalogVariants: vi.fn(async () => structuredClone(variants)),
    updateVariantStripeCatalog: vi.fn(async ({
      leaseToken,
      variantId,
      expectedStripeProductId,
      expectedStripeDepositPriceId,
      stripeProductId,
      stripeDepositPriceId,
    }) => {
      const variant = variants.find(({ id }) => id === variantId)
      if (!leaseToken) throw new Error('catalog_sync_lease_lost')
      if (
        !variant
        || variant.stripeProductId !== expectedStripeProductId
        || variant.stripeDepositPriceId !== expectedStripeDepositPriceId
      ) throw new Error('catalog_variant_changed')
      variant.stripeProductId = stripeProductId
      variant.stripeDepositPriceId = stripeDepositPriceId
    }),
  }
  return { variants, products, prices, stripe, store }
}

const TWO_VARIANTS = [
  {
    id: 'variant_face', name: 'Facial', priceMxnMinor: 100000, appointmentTypeId: 'type_hydra', appointmentTypeName: 'Hydrafacial', stripeProductId: null, stripeDepositPriceId: null,
  },
  {
    id: 'variant_deluxe', name: 'Deluxe', priceMxnMinor: 200000, appointmentTypeId: 'type_hydra', appointmentTypeName: 'Hydrafacial', stripeProductId: null, stripeDepositPriceId: null,
  },
]

describe('Stripe catalog sync', () => {
  it('creates one treatment Product and one 30% immutable Price per active variant', async () => {
    const fixture = catalogFixture(TWO_VARIANTS)

    const result = await syncStripeCatalog(fixture)

    expect(result).toEqual({ treatments: 1, variants: 2, productsCreated: 1, pricesCreated: 2, pricesReplaced: 0 })
    expect(fixture.stripe.products.create).toHaveBeenCalledTimes(1)
    expect(fixture.stripe.prices.create.mock.calls.map(([input]) => input.unit_amount)).toEqual([30000, 60000])
    expect(fixture.stripe.prices.create.mock.calls[0][0]).toMatchObject({
      currency: 'mxn',
      product: 'prod_1',
      metadata: { bouclier_variant_id: 'variant_face', bouclier_deposit_rate_bps: '3000' },
    })
    expect(fixture.variants.map(({ stripeProductId }) => stripeProductId)).toEqual(['prod_1', 'prod_1'])
    expect(fixture.variants.map(({ stripeDepositPriceId }) => stripeDepositPriceId)).toEqual(['price_1', 'price_2'])
  })

  it('is idempotent when the persisted Product and Prices still match', async () => {
    const fixture = catalogFixture(TWO_VARIANTS)

    await syncStripeCatalog(fixture)
    await syncStripeCatalog(fixture)

    expect(fixture.stripe.products.create).toHaveBeenCalledTimes(1)
    expect(fixture.stripe.prices.create).toHaveBeenCalledTimes(2)
    expect(fixture.variants.map(({ stripeDepositPriceId }) => stripeDepositPriceId)).toEqual(['price_1', 'price_2'])
  })

  it('deactivates and replaces a stale persisted Price', async () => {
    const fixture = catalogFixture([{ ...TWO_VARIANTS[0], stripeProductId: 'prod_existing', stripeDepositPriceId: 'price_stale' }])
    fixture.products.set('prod_existing', {
      id: 'prod_existing', active: true, name: 'Hydrafacial', metadata: { bouclier_catalog: 'appointment_deposits', bouclier_appointment_type_id: 'type_hydra' },
    })
    fixture.prices.set('price_stale', {
      id: 'price_stale', active: true, type: 'one_time', currency: 'mxn', unit_amount: 29999, product: 'prod_existing', metadata: {
        bouclier_catalog: 'appointment_deposits', bouclier_variant_id: 'variant_face', bouclier_appointment_type_id: 'type_hydra', bouclier_deposit_rate_bps: '3000', bouclier_variant_price_mxn_minor: '100000',
      },
    })

    const result = await syncStripeCatalog(fixture)

    expect(result).toMatchObject({ productsCreated: 0, pricesCreated: 1, pricesReplaced: 1 })
    expect(fixture.prices.get('price_stale').active).toBe(false)
    expect(fixture.variants[0].stripeDepositPriceId).toBe('price_1')
  })

  it('stops on transient Stripe retrieval errors instead of creating duplicates', async () => {
    const fixture = catalogFixture([{ ...TWO_VARIANTS[0], stripeProductId: 'prod_existing' }])
    fixture.stripe.products.retrieve.mockRejectedValue(Object.assign(
      new Error('connection failed'),
      { code: 'api_connection_error' },
    ))

    await expect(syncStripeCatalog(fixture)).rejects.toThrow('connection failed')
    expect(fixture.stripe.products.create).not.toHaveBeenCalled()
  })

  it('discovers and reuses managed objects when database mapping is missing', async () => {
    const fixture = catalogFixture([TWO_VARIANTS[0]])
    fixture.products.set('prod_managed', {
      id: 'prod_managed',
      active: true,
      name: 'Hydrafacial',
      metadata: { bouclier_catalog: 'appointment_deposits', bouclier_appointment_type_id: 'type_hydra' },
    })
    fixture.prices.set('price_managed', {
      id: 'price_managed',
      active: true,
      type: 'one_time',
      currency: 'mxn',
      unit_amount: 30000,
      product: 'prod_managed',
      metadata: {
        bouclier_catalog: 'appointment_deposits',
        bouclier_variant_id: 'variant_face',
        bouclier_appointment_type_id: 'type_hydra',
        bouclier_deposit_rate_bps: '3000',
        bouclier_variant_price_mxn_minor: '100000',
      },
    })

    const result = await syncStripeCatalog(fixture)

    expect(result).toMatchObject({ productsCreated: 0, pricesCreated: 0 })
    expect(fixture.variants[0]).toMatchObject({
      stripeProductId: 'prod_managed', stripeDepositPriceId: 'price_managed',
    })
  })

  it('repairs a foreign persisted Product mapping without updating or deactivating the Product', async () => {
    const fixture = catalogFixture([{
      ...TWO_VARIANTS[0], stripeProductId: 'prod_foreign', stripeDepositPriceId: null,
    }])
    const foreignProduct = {
      id: 'prod_foreign', active: true, name: 'Unrelated merchant product',
      metadata: { bouclier_appointment_type_id: 'type_hydra', owner: 'another-system' },
    }
    fixture.products.set('prod_foreign', structuredClone(foreignProduct))

    await syncStripeCatalog(fixture)

    expect(fixture.products.get('prod_foreign')).toEqual(foreignProduct)
    expect(fixture.stripe.products.create).toHaveBeenCalledOnce()
    expect(fixture.variants[0].stripeProductId).not.toBe('prod_foreign')
  })

  it('repairs a foreign persisted Price mapping without deactivating the Price', async () => {
    const fixture = catalogFixture([{
      ...TWO_VARIANTS[0], stripeProductId: 'prod_managed', stripeDepositPriceId: 'price_unmanaged',
    }])
    fixture.products.set('prod_managed', {
      id: 'prod_managed', active: true, name: 'Hydrafacial',
      metadata: { bouclier_catalog: 'appointment_deposits', bouclier_appointment_type_id: 'type_hydra' },
    })
    fixture.prices.set('price_unmanaged', {
      id: 'price_unmanaged', active: true, type: 'one_time', currency: 'mxn', unit_amount: 30000, product: 'prod_managed',
      metadata: { bouclier_variant_id: 'variant_face', bouclier_appointment_type_id: 'type_hydra', bouclier_deposit_rate_bps: '3000' },
    })

    await syncStripeCatalog(fixture)

    expect(fixture.prices.get('price_unmanaged').active).toBe(true)
    expect(fixture.prices.get('price_unmanaged').metadata).not.toHaveProperty('bouclier_catalog')
    expect(fixture.stripe.prices.create).toHaveBeenCalledOnce()
    expect(fixture.variants[0].stripeDepositPriceId).not.toBe('price_unmanaged')
  })

  it('paginates discovery and deactivates duplicate managed objects', async () => {
    const fixture = catalogFixture([TWO_VARIANTS[0]], { pageSize: 1 })
    for (const id of ['prod_b', 'prod_a']) {
      fixture.products.set(id, {
        id,
        active: true,
        name: 'Hydrafacial',
        metadata: { bouclier_catalog: 'appointment_deposits', bouclier_appointment_type_id: 'type_hydra' },
      })
    }
    for (const [id, product] of [['price_b', 'prod_b'], ['price_a', 'prod_a']]) {
      fixture.prices.set(id, {
        id,
        active: true,
        type: 'one_time',
        currency: 'mxn',
        unit_amount: 30000,
        product,
        metadata: {
          bouclier_catalog: 'appointment_deposits',
          bouclier_variant_id: 'variant_face',
          bouclier_appointment_type_id: 'type_hydra',
          bouclier_deposit_rate_bps: '3000',
          bouclier_variant_price_mxn_minor: '100000',
        },
      })
    }

    await syncStripeCatalog(fixture)

    expect(fixture.stripe.products.list).toHaveBeenCalledTimes(2)
    expect(fixture.stripe.prices.list).toHaveBeenCalledTimes(2)
    expect(fixture.variants[0]).toMatchObject({ stripeProductId: 'prod_a', stripeDepositPriceId: 'price_a' })
    expect(fixture.products.get('prod_b').active).toBe(false)
    expect(fixture.prices.get('price_b').active).toBe(false)
  })

  it('deactivates managed catalog objects for inactive variants and treatments', async () => {
    const fixture = catalogFixture([{
      ...TWO_VARIANTS[0], isActive: false, stripeProductId: 'prod_inactive', stripeDepositPriceId: 'price_inactive',
    }])
    fixture.products.set('prod_inactive', {
      id: 'prod_inactive', active: true, metadata: { bouclier_catalog: 'appointment_deposits', bouclier_appointment_type_id: 'type_hydra' },
    })
    fixture.prices.set('price_inactive', {
      id: 'price_inactive', active: true, type: 'one_time', currency: 'mxn', unit_amount: 30000, product: 'prod_inactive',
      metadata: { bouclier_catalog: 'appointment_deposits', bouclier_variant_id: 'variant_face', bouclier_appointment_type_id: 'type_hydra', bouclier_deposit_rate_bps: '3000', bouclier_variant_price_mxn_minor: '100000' },
    })

    await syncStripeCatalog(fixture)

    expect(fixture.products.get('prod_inactive').active).toBe(false)
    expect(fixture.prices.get('price_inactive').active).toBe(false)
  })

  it('recovers after database persistence failure without duplicating Stripe objects', async () => {
    const fixture = catalogFixture([TWO_VARIANTS[0]])
    fixture.store.updateVariantStripeCatalog.mockRejectedValueOnce(new Error('database unavailable'))

    await expect(syncStripeCatalog(fixture)).rejects.toThrow('database unavailable')
    await syncStripeCatalog(fixture)

    expect(fixture.stripe.products.create).toHaveBeenCalledTimes(1)
    expect(fixture.stripe.prices.create).toHaveBeenCalledTimes(1)
    expect(fixture.store.releaseCatalogSyncLease).toHaveBeenCalledTimes(2)
  })

  it('rejects a concurrent sync before reading or mutating Stripe', async () => {
    const fixture = catalogFixture([TWO_VARIANTS[0]])
    fixture.store.acquireCatalogSyncLease.mockResolvedValue(false)

    await expect(syncStripeCatalog(fixture)).rejects.toThrow('catalog_sync_in_progress')
    expect(fixture.stripe.products.list).not.toHaveBeenCalled()
    expect(fixture.stripe.products.create).not.toHaveBeenCalled()
  })
})
