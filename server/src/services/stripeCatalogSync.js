import { createHash } from 'node:crypto'
import { calculateDepositMinor } from '../../../src/booking/deposit.js'

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

function priceMatches(price, { variant, productId, depositMxnMinor }) {
  const priceProductId = typeof price?.product === 'string' ? price.product : price?.product?.id
  return Boolean(
    price?.active
    && price.type === 'one_time'
    && price.currency === 'mxn'
    && price.unit_amount === depositMxnMinor
    && priceProductId === productId
    && price.metadata?.bouclier_variant_id === variant.id
    && price.metadata?.bouclier_deposit_rate_bps === String(DEPOSIT_RATE_BPS)
  )
}

async function ensureProduct({ stripe, appointmentTypeId, appointmentTypeName, variants, summary }) {
  const persistedId = variants.find(({ stripeProductId }) => stripeProductId)?.stripeProductId
  let product = await retrieveOrNull(stripe.products.retrieve.bind(stripe.products), persistedId)
  if (product?.metadata?.bouclier_appointment_type_id !== appointmentTypeId) product = null

  const input = {
    name: appointmentTypeName,
    active: true,
    metadata: {
      bouclier_catalog: 'appointment_deposits',
      bouclier_appointment_type_id: appointmentTypeId,
    },
  }

  if (!product) {
    product = await stripe.products.create(input, {
      idempotencyKey: `bouclier-product-${appointmentTypeId}`,
    })
    summary.productsCreated += 1
  } else {
    product = await stripe.products.update(product.id, input, {
      idempotencyKey: stateKey(`bouclier-product-${appointmentTypeId}-update`, input),
    })
  }
  return product
}

async function ensurePrice({ stripe, variant, productId, summary }) {
  const depositMxnMinor = calculateDepositMinor(variant.priceMxnMinor)
  const persisted = await retrieveOrNull(stripe.prices.retrieve.bind(stripe.prices), variant.stripeDepositPriceId)
  if (priceMatches(persisted, { variant, productId, depositMxnMinor })) return persisted

  if (persisted?.active) {
    await stripe.prices.update(persisted.id, { active: false }, {
      idempotencyKey: `bouclier-price-${variant.id}-${persisted.id}-deactivate`,
    })
    summary.pricesReplaced += 1
  }

  const price = await stripe.prices.create({
    currency: 'mxn',
    unit_amount: depositMxnMinor,
    product: productId,
    nickname: `Anticipo 30% - ${variant.name}`,
    metadata: {
      bouclier_catalog: 'appointment_deposits',
      bouclier_variant_id: variant.id,
      bouclier_appointment_type_id: variant.appointmentTypeId,
      bouclier_deposit_rate_bps: String(DEPOSIT_RATE_BPS),
      bouclier_variant_price_mxn_minor: String(variant.priceMxnMinor),
    },
  }, {
    idempotencyKey: `bouclier-price-${variant.id}-${productId}-${depositMxnMinor}`,
  })
  summary.pricesCreated += 1
  return price
}

export async function syncStripeCatalog({ stripe, store }) {
  const variants = await store.listActiveCatalogVariants()
  const treatments = new Map()
  for (const variant of variants) {
    const treatmentVariants = treatments.get(variant.appointmentTypeId) || []
    treatmentVariants.push(variant)
    treatments.set(variant.appointmentTypeId, treatmentVariants)
  }
  const summary = {
    treatments: treatments.size,
    variants: variants.length,
    productsCreated: 0,
    pricesCreated: 0,
    pricesReplaced: 0,
  }

  for (const [appointmentTypeId, treatmentVariants] of treatments) {
    const product = await ensureProduct({
      stripe,
      appointmentTypeId,
      appointmentTypeName: treatmentVariants[0].appointmentTypeName,
      variants: treatmentVariants,
      summary,
    })
    for (const variant of treatmentVariants) {
      const price = await ensurePrice({ stripe, variant, productId: product.id, summary })
      await store.updateVariantStripeCatalog({
        variantId: variant.id,
        stripeProductId: product.id,
        stripeDepositPriceId: price.id,
      })
    }
  }

  return summary
}
