import { createHash, randomUUID } from 'node:crypto'
import { calculateDepositMinor } from '../../../src/booking/deposit.js'

const CATALOG = 'appointment_deposits'
const DEPOSIT_RATE_BPS = 3000

function stateKey(prefix, value) {
  const digest = createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 32)
  return `${prefix}-${digest}`
}

async function retrieveOrNull(retrieve, id) {
  if (!id) return null
  try {
    return await retrieve(id)
  } catch (error) {
    if (error?.code === 'resource_missing' || error?.statusCode === 404) return null
    throw error
  }
}

async function listAll(list) {
  const items = []
  let startingAfter
  do {
    const page = await list({ limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) })
    items.push(...page.data)
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined
    if (page.has_more && !startingAfter) throw new Error('stripe_pagination_invalid')
  } while (startingAfter)
  return items
}

function managed(item) {
  return item.metadata?.bouclier_catalog === CATALOG
}

function productTypeId(product) {
  return product.metadata?.bouclier_appointment_type_id
}

function priceProductId(price) {
  return typeof price?.product === 'string' ? price.product : price?.product?.id
}

function priceMatches(price, { variant, productId, depositMxnMinor }) {
  return Boolean(
    price?.active
    && managed(price)
    && price.type === 'one_time'
    && price.currency === 'mxn'
    && price.unit_amount === depositMxnMinor
    && priceProductId(price) === productId
    && price.metadata?.bouclier_variant_id === variant.id
    && price.metadata?.bouclier_deposit_rate_bps === String(DEPOSIT_RATE_BPS)
  )
}

function canonical(items, preferredIds = []) {
  const active = items.filter((item) => item.active).sort((left, right) => left.id.localeCompare(right.id))
  return active.find(({ id }) => preferredIds.includes(id)) || active[0] || null
}

async function deactivatePrice(stripe, price, summary) {
  if (!price?.active) return
  await stripe.prices.update(price.id, { active: false }, {
    idempotencyKey: `bouclier-price-${price.id}-deactivate`,
  })
  price.active = false
  summary.pricesReplaced += 1
}

async function ensureProduct({ stripe, appointmentTypeId, appointmentTypeName, variants, products, summary }) {
  const preferredIds = variants.map(({ stripeProductId }) => stripeProductId).filter(Boolean)
  const candidates = products.filter((product) => productTypeId(product) === appointmentTypeId)
  for (const persistedId of preferredIds) {
    if (candidates.some(({ id }) => id === persistedId)) continue
    const persisted = await retrieveOrNull(stripe.products.retrieve.bind(stripe.products), persistedId)
    if (persisted && productTypeId(persisted) === appointmentTypeId) candidates.push(persisted)
  }

  const input = {
    name: appointmentTypeName,
    active: true,
    metadata: {
      bouclier_catalog: CATALOG,
      bouclier_appointment_type_id: appointmentTypeId,
    },
  }
  let product = canonical(candidates, preferredIds)
  if (!product) {
    product = await stripe.products.create(input, {
      idempotencyKey: `bouclier-product-${appointmentTypeId}`,
    })
    products.push(product)
    summary.productsCreated += 1
  } else {
    product = await stripe.products.update(product.id, input, {
      idempotencyKey: stateKey(`bouclier-product-${appointmentTypeId}-update`, input),
    })
    Object.assign(candidates.find(({ id }) => id === product.id) || product, product)
  }
  return { product, duplicates: candidates.filter(({ id, active }) => active && id !== product.id) }
}

async function ensurePrice({ stripe, variant, productId, prices, summary }) {
  const depositMxnMinor = calculateDepositMinor(variant.priceMxnMinor)
  const candidates = prices.filter((price) => price.metadata?.bouclier_variant_id === variant.id)
  if (variant.stripeDepositPriceId && !candidates.some(({ id }) => id === variant.stripeDepositPriceId)) {
    const persisted = await retrieveOrNull(stripe.prices.retrieve.bind(stripe.prices), variant.stripeDepositPriceId)
    if (persisted) candidates.push(persisted)
  }
  const matching = candidates.filter((price) => priceMatches(price, { variant, productId, depositMxnMinor }))
  let price = canonical(matching, [variant.stripeDepositPriceId].filter(Boolean))
  if (!price) {
    price = await stripe.prices.create({
      currency: 'mxn',
      unit_amount: depositMxnMinor,
      product: productId,
      nickname: `Anticipo 30% - ${variant.name}`,
      metadata: {
        bouclier_catalog: CATALOG,
        bouclier_variant_id: variant.id,
        bouclier_appointment_type_id: variant.appointmentTypeId,
        bouclier_deposit_rate_bps: String(DEPOSIT_RATE_BPS),
        bouclier_variant_price_mxn_minor: String(variant.priceMxnMinor),
      },
    }, {
      idempotencyKey: `bouclier-price-${variant.id}-${productId}-${depositMxnMinor}`,
    })
    prices.push(price)
    summary.pricesCreated += 1
  }
  for (const duplicate of candidates) {
    if (duplicate.id !== price.id) await deactivatePrice(stripe, duplicate, summary)
  }
  return price
}

export async function syncStripeCatalog({ stripe, store }) {
  const leaseToken = randomUUID()
  if (!await store.acquireCatalogSyncLease(leaseToken)) throw new Error('catalog_sync_in_progress')

  try {
    const [variants, listedProducts, listedPrices] = await Promise.all([
      store.listCatalogVariants(),
      listAll(stripe.products.list.bind(stripe.products)),
      listAll(stripe.prices.list.bind(stripe.prices)),
    ])
    const products = listedProducts.filter(managed)
    const prices = listedPrices.filter(managed)
    const activeVariants = variants.filter((variant) => variant.isActive && variant.appointmentTypeActive)
    const treatments = new Map()
    for (const variant of activeVariants) {
      const treatmentVariants = treatments.get(variant.appointmentTypeId) || []
      treatmentVariants.push(variant)
      treatments.set(variant.appointmentTypeId, treatmentVariants)
    }
    const summary = {
      treatments: treatments.size,
      variants: activeVariants.length,
      productsCreated: 0,
      pricesCreated: 0,
      pricesReplaced: 0,
    }
    const canonicalProductIds = new Set()
    const activeVariantIds = new Set(activeVariants.map(({ id }) => id))

    for (const [appointmentTypeId, treatmentVariants] of treatments) {
      if (!await store.renewCatalogSyncLease(leaseToken)) throw new Error('catalog_sync_lease_lost')
      const { product, duplicates } = await ensureProduct({
        stripe,
        appointmentTypeId,
        appointmentTypeName: treatmentVariants[0].appointmentTypeName,
        variants: treatmentVariants,
        products,
        summary,
      })
      canonicalProductIds.add(product.id)
      for (const variant of treatmentVariants) {
        if (!await store.renewCatalogSyncLease(leaseToken)) throw new Error('catalog_sync_lease_lost')
        const price = await ensurePrice({ stripe, variant, productId: product.id, prices, summary })
        await store.updateVariantStripeCatalog({
          variantId: variant.id,
          stripeProductId: product.id,
          stripeDepositPriceId: price.id,
        })
      }
      for (const duplicate of duplicates) {
        await stripe.products.update(duplicate.id, { active: false }, {
          idempotencyKey: `bouclier-product-${duplicate.id}-deactivate`,
        })
        duplicate.active = false
      }
    }

    if (!await store.renewCatalogSyncLease(leaseToken)) throw new Error('catalog_sync_lease_lost')
    for (const price of prices) {
      if (price.active && !activeVariantIds.has(price.metadata?.bouclier_variant_id)) {
        await deactivatePrice(stripe, price, summary)
      }
    }
    for (const product of products) {
      if (product.active && !canonicalProductIds.has(product.id)) {
        await stripe.products.update(product.id, { active: false }, {
          idempotencyKey: `bouclier-product-${product.id}-deactivate`,
        })
        product.active = false
      }
    }
    return summary
  } finally {
    await store.releaseCatalogSyncLease(leaseToken)
  }
}

export async function checkStripeCatalogReadiness({ stripe, store }) {
  const variants = await store.listActiveCatalogVariants()
  if (!variants.length) throw new Error('payment_catalog_incomplete')
  for (const variant of variants) {
    if (!variant.stripeProductId || !variant.stripeDepositPriceId) throw new Error('payment_catalog_incomplete')
    const [product, price] = await Promise.all([
      stripe.products.retrieve(variant.stripeProductId),
      stripe.prices.retrieve(variant.stripeDepositPriceId),
    ])
    if (
      !product.active
      || productTypeId(product) !== variant.appointmentTypeId
      || !managed(product)
      || !priceMatches(price, {
        variant,
        productId: product.id,
        depositMxnMinor: calculateDepositMinor(variant.priceMxnMinor),
      })
      || !managed(price)
    ) throw new Error('payment_catalog_mismatch')
  }
}
