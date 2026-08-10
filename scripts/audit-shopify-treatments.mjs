import { SOURCE_TREATMENTS } from '../src/data/treatments.js'

const CATALOG_URL = process.env.SHOPIFY_TREATMENTS_URL
  ?? 'https://bouclier-dermatologia.com/collections/tratamientos-cabina/products.json?limit=250'

function htmlToComparableText(value = '') {
  const plainText = value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")

  return plainText
    .split(/\r?\n/)
    .filter((line) => !/^\s*cotiza por whatsapp\b/i.test(line))
    .join(' ')
    .normalize('NFC')
    .replace(/[\u00a0\u202f\u2060]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function comparableVariant(variant) {
  return {
    id: String(variant.id),
    name: variant.title,
    priceMxnMinor: Math.round(Number(variant.price) * 100),
    active: Boolean(variant.available),
  }
}

function localVariant(variant) {
  return {
    id: String(variant.id),
    name: variant.name,
    priceMxnMinor: variant.priceMxnMinor,
    active: variant.active,
  }
}

const response = await fetch(CATALOG_URL, { headers: { accept: 'application/json' } })

if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
  throw new Error(`Shopify catalog unavailable: HTTP ${response.status}`)
}

const { products = [] } = await response.json()
const productsByHandle = new Map(products.map((product) => [product.handle, product]))
const expectedHandles = new Set(SOURCE_TREATMENTS.map(({ sourceHandle }) => sourceHandle))
const failures = []

for (const treatment of SOURCE_TREATMENTS) {
  const product = productsByHandle.get(treatment.sourceHandle)

  if (!product) {
    failures.push(`${treatment.name}: missing handle ${treatment.sourceHandle}`)
    continue
  }

  if (product.title !== treatment.name) failures.push(`${treatment.name}: title differs`)
  if (product.images.length !== treatment.gallery.length) failures.push(`${treatment.name}: image count differs`)

  const liveDescription = htmlToComparableText(product.body_html)
  const localDescription = htmlToComparableText(treatment.description)
  if (liveDescription !== localDescription) failures.push(`${treatment.name}: clinical description differs`)

  const liveVariants = product.variants.map(comparableVariant)
  const localVariants = treatment.variants.map(localVariant)
  if (JSON.stringify(liveVariants) !== JSON.stringify(localVariants)) {
    failures.push(`${treatment.name}: variants, prices, or availability differ`)
  }
}

for (const product of products) {
  if (!expectedHandles.has(product.handle)) failures.push(`${product.title}: exists in Shopify but not in Clinique`)
}

console.log(`Shopify treatments: ${products.length}`)
console.log(`Clinique treatments: ${SOURCE_TREATMENTS.length}`)

if (failures.length > 0) {
  console.error('Catalog audit failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exitCode = 1
} else {
  console.log('Catalog audit passed: titles, clinical copy, images, variants, prices, and availability are aligned.')
}
