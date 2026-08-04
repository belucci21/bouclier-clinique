const REQUIRED = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PUBLIC_WEB_URL',
  'PORT',
]

export function loadConfig(env = process.env) {
  const missing = REQUIRED.filter((name) => !env[name]?.trim())
  if (missing.length) throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`)

  const port = Number(env.PORT)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT no es válido')

  return {
    stripeSecretKey: env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
    supabaseUrl: env.SUPABASE_URL,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    publicWebUrl: env.PUBLIC_WEB_URL.replace(/\/$/, ''),
    port,
  }
}
