import { describe, expect, it } from 'vitest'
import { loadConfig } from '../src/config.js'

const REQUIRED_RUNTIME = {
  SUPABASE_URL: 'https://tmcxgiqmmjpgxqrivbod.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-test-value',
  PUBLIC_WEB_URL: 'https://bouclier-clinique.com',
  PORT: '3000',
}

describe('server configuration', () => {
  it('defaults payments off and starts without any Stripe credential', () => {
    const config = loadConfig(REQUIRED_RUNTIME)

    expect(config).toMatchObject({
      paymentsEnabled: false,
      paymentsConfigured: false,
      allowedOrigin: 'https://bouclier-clinique.com',
      stripeSecretKey: undefined,
      stripeWebhookSecret: undefined,
      stripePublishableKey: undefined,
    })
  })

  it('requires the complete validated Stripe setup when payments are enabled', () => {
    expect(() => loadConfig({ ...REQUIRED_RUNTIME, PAYMENTS_ENABLED: 'true' }))
      .toThrow('STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PUBLISHABLE_KEY')

    expect(() => loadConfig({
      ...REQUIRED_RUNTIME,
      PAYMENTS_ENABLED: 'true',
      STRIPE_SECRET_KEY: 'not-a-secret-key',
      STRIPE_WEBHOOK_SECRET: 'not-a-webhook-secret',
      STRIPE_PUBLISHABLE_KEY: 'not-a-publishable-key',
    })).toThrow('configuracion de Stripe no es valida')
  })

  it('accepts a complete test-mode Stripe setup when payments are enabled', () => {
    const config = loadConfig({
      ...REQUIRED_RUNTIME,
      PAYMENTS_ENABLED: 'true',
      STRIPE_SECRET_KEY: 'sk_test_rotated_example',
      STRIPE_WEBHOOK_SECRET: 'whsec_rotated_example',
      STRIPE_PUBLISHABLE_KEY: 'pk_test_rotated_example',
    })

    expect(config).toMatchObject({ paymentsEnabled: true, paymentsConfigured: true })
  })

  it('rejects ambiguous payment flag values', () => {
    expect(() => loadConfig({ ...REQUIRED_RUNTIME, PAYMENTS_ENABLED: 'yes' }))
      .toThrow('PAYMENTS_ENABLED debe ser true o false')
  })

  it('accepts only an HTTPS browser origin for an API subdomain deployment', () => {
    expect(loadConfig({ ...REQUIRED_RUNTIME, API_ALLOWED_ORIGIN: 'https://www.bouclier-clinique.com/' }))
      .toMatchObject({ allowedOrigin: 'https://www.bouclier-clinique.com' })

    expect(() => loadConfig({ ...REQUIRED_RUNTIME, API_ALLOWED_ORIGIN: 'http://www.bouclier-clinique.com' }))
      .toThrow('API_ALLOWED_ORIGIN debe ser un origen HTTPS')
  })
})
