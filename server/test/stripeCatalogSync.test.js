import { describe, expect, it, vi } from 'vitest'
import { syncStripeCatalog } from '../src/services/stripeCatalogSync.js'

function catalogFixture(initialVariants) {
  const variants = structuredClone(initialVariants)
  const products = new Map()
  const prices = new Map()
  let productSequence = 0
  let priceSequence = 0

  const stripe = {
    products: {
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
    listActiveCatalogVariants: vi.fn(async () => structuredClone(variants)),
    updateVariantStripeCatalog: vi.fn(async ({ variantId, stripeProductId, stripeDepositPriceId }) => {
      const variant = variants.find(({ id }) => id === variantId)
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
      id: 'prod_existing', active: true, name: 'Hydrafacial', metadata: { bouclier_appointment_type_id: 'type_hydra' },
    })
    fixture.prices.set('price_stale', {
      id: 'price_stale', active: true, type: 'one_time', currency: 'mxn', unit_amount: 29999, product: 'prod_existing', metadata: { bouclier_variant_id: 'variant_face' },
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
})
