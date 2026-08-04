import { describe, expect, it } from 'vitest'
import { loadConfig } from '../src/config.js'

const REQUIRED_RUNTIME = {
  SUPABASE_URL: 'https://tmcxgiqmmjpgxqrivbod.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-test-value',
  PUBLIC_WEB_URL: 'https://bouclier-clinique.com',
  PORT: '3000',
}

const TEST_STRIPE = {
  STRIPE_SECRET_KEY: 'sk_test_1234567890abcdef',
  STRIPE_WEBHOOK_SECRET: 'whsec_1234567890abcdef',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_1234567890abcdef',
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
      ...TEST_STRIPE,
    })

    expect(config).toMatchObject({ paymentsEnabled: true, paymentsConfigured: true })
  })

  it.each([
    ['bare secret prefix', { ...TEST_STRIPE, STRIPE_SECRET_KEY: 'sk_test_' }],
    ['bare publishable prefix', { ...TEST_STRIPE, STRIPE_PUBLISHABLE_KEY: 'pk_test_' }],
    ['bare webhook prefix', { ...TEST_STRIPE, STRIPE_WEBHOOK_SECRET: 'whsec_' }],
    ['padded secret', { ...TEST_STRIPE, STRIPE_SECRET_KEY: ` ${TEST_STRIPE.STRIPE_SECRET_KEY}` }],
    ['padded webhook', { ...TEST_STRIPE, STRIPE_WEBHOOK_SECRET: `${TEST_STRIPE.STRIPE_WEBHOOK_SECRET} ` }],
    ['malformed secret body', { ...TEST_STRIPE, STRIPE_SECRET_KEY: 'sk_test_1234567890abc!' }],
    ['mixed modes', { ...TEST_STRIPE, STRIPE_PUBLISHABLE_KEY: 'pk_live_1234567890abcdef' }],
  ])('rejects %s credentials at startup', (_label, stripeEnv) => {
    expect(() => loadConfig({ ...REQUIRED_RUNTIME, PAYMENTS_ENABLED: 'true', ...stripeEnv }))
      .toThrow('configuracion de Stripe no es valida')
  })

  it('requires explicit rotation attestation for live startup', () => {
    const liveStripe = {
      STRIPE_SECRET_KEY: 'sk_live_1234567890abcdef',
      STRIPE_WEBHOOK_SECRET: 'whsec_1234567890abcdef',
      STRIPE_PUBLISHABLE_KEY: 'pk_live_1234567890abcdef',
    }

    expect(() => loadConfig({ ...REQUIRED_RUNTIME, PAYMENTS_ENABLED: 'true', ...liveStripe }))
      .toThrow('STRIPE_CREDENTIAL_ROTATED=true')
    expect(loadConfig({
      ...REQUIRED_RUNTIME,
      PAYMENTS_ENABLED: 'true',
      STRIPE_CREDENTIAL_ROTATED: 'true',
      ...liveStripe,
    })).toMatchObject({ paymentsEnabled: true, paymentsConfigured: true })
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
