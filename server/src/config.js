const REQUIRED_RUNTIME = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PUBLIC_WEB_URL',
  'PORT',
]

const REQUIRED_STRIPE = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PUBLISHABLE_KEY',
]

function paymentFlag(value) {
  if (value === undefined || value === '') return false
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error('PAYMENTS_ENABLED debe ser true o false')
}

function validStripeSetup(env) {
  return /^sk_(test|live)_/.test(env.STRIPE_SECRET_KEY)
    && /^whsec_/.test(env.STRIPE_WEBHOOK_SECRET)
    && /^pk_(test|live)_/.test(env.STRIPE_PUBLISHABLE_KEY)
    && env.STRIPE_SECRET_KEY.slice(3, 7) === env.STRIPE_PUBLISHABLE_KEY.slice(3, 7)
}

function httpsOrigin(value) {
  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error('API_ALLOWED_ORIGIN debe ser un origen HTTPS')
  }
  if (url.protocol !== 'https:' || value.replace(/\/$/, '') !== url.origin) {
    throw new Error('API_ALLOWED_ORIGIN debe ser un origen HTTPS')
  }
  return url.origin
}

export function loadConfig(env = process.env) {
  const missingRuntime = REQUIRED_RUNTIME.filter((name) => !env[name]?.trim())
  if (missingRuntime.length) throw new Error(`Faltan variables de entorno: ${missingRuntime.join(', ')}`)

  const paymentsEnabled = paymentFlag(env.PAYMENTS_ENABLED?.trim())
  const missingStripe = REQUIRED_STRIPE.filter((name) => !env[name]?.trim())
  if (paymentsEnabled && missingStripe.length) {
    throw new Error(`Faltan variables de entorno: ${missingStripe.join(', ')}`)
  }
  if (paymentsEnabled && !validStripeSetup(env)) throw new Error('La configuracion de Stripe no es valida')

  const port = Number(env.PORT)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT no es valido')
  const publicWebUrl = env.PUBLIC_WEB_URL.replace(/\/$/, '')

  return {
    paymentsEnabled,
    paymentsConfigured: paymentsEnabled && missingStripe.length === 0,
    stripeSecretKey: env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
    stripePublishableKey: env.STRIPE_PUBLISHABLE_KEY,
    supabaseUrl: env.SUPABASE_URL,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    publicWebUrl,
    allowedOrigin: httpsOrigin(env.API_ALLOWED_ORIGIN?.trim() || publicWebUrl),
    environment: env.NODE_ENV || 'development',
    port,
  }
}
