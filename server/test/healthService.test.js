import { describe, expect, it, vi } from 'vitest'
import { createHealthService } from '../src/services/healthService.js'

function readyCatalogFixture() {
  const store = {
    checkHealth: vi.fn().mockResolvedValue(undefined),
    checkPaymentCatalog: vi.fn().mockResolvedValue(undefined),
    listActiveCatalogVariants: vi.fn().mockResolvedValue([{
      id: 'variant_face',
      name: 'Facial',
      priceMxnMinor: 100000,
      appointmentTypeId: 'type_hydra',
      appointmentTypeName: 'Hydrafacial',
      stripeProductId: 'prod_managed',
      stripeDepositPriceId: 'price_managed',
    }]),
  }
  const product = {
    id: 'prod_managed', active: true,
    metadata: { bouclier_catalog: 'appointment_deposits', bouclier_appointment_type_id: 'type_hydra' },
  }
  const price = {
    id: 'price_managed', active: true, type: 'one_time', currency: 'mxn', unit_amount: 30000, product: 'prod_managed',
    metadata: { bouclier_catalog: 'appointment_deposits', bouclier_variant_id: 'variant_face', bouclier_deposit_rate_bps: '3000' },
  }
  const stripe = {
    products: { retrieve: vi.fn().mockResolvedValue(product) },
    prices: { retrieve: vi.fn().mockResolvedValue(price) },
  }
  return { store, stripe, product, price }
}

describe('health service', () => {
  it('treats intentionally disabled payments as safe while Supabase is reachable', async () => {
    const store = { checkHealth: vi.fn().mockResolvedValue(undefined), checkPaymentCatalog: vi.fn() }
    const service = createHealthService({
      store,
      paymentsEnabled: false,
      paymentsConfigured: false,
      environment: 'test',
      nodeVersion: 'v22.0.0',
    })

    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      runtime: { nodeVersion: 'v22.0.0', environment: 'test' },
      supabase: { configured: true, ready: true },
      payments: { enabled: false, configured: false, ready: false },
    })
    expect(store.checkPaymentCatalog).not.toHaveBeenCalled()
  })

  it('reports degraded readiness without leaking the Supabase error', async () => {
    const store = { checkHealth: vi.fn().mockRejectedValue(new Error('service-role-test-value')), checkPaymentCatalog: vi.fn() }
    const service = createHealthService({
      store,
      paymentsEnabled: true,
      paymentsConfigured: true,
      environment: 'production',
      nodeVersion: 'v22.0.0',
    })

    await expect(service.check()).resolves.toEqual({
      status: 'degraded',
      runtime: { nodeVersion: 'v22.0.0', environment: 'production' },
      supabase: { configured: true, ready: false },
      payments: { enabled: true, configured: true, ready: false },
    })
  })

  it('reports degraded readiness when the enabled payment catalog is incomplete', async () => {
    const store = {
      checkHealth: vi.fn().mockResolvedValue(undefined),
      checkPaymentCatalog: vi.fn().mockRejectedValue(new Error('variant_face')),
    }
    const service = createHealthService({
      store,
      paymentsEnabled: true,
      paymentsConfigured: true,
      environment: 'production',
      nodeVersion: 'v22.0.0',
    })

    await expect(service.check()).resolves.toMatchObject({
      status: 'degraded',
      supabase: { configured: true, ready: true },
      payments: { enabled: true, configured: true, ready: false },
    })
  })

  it('reports degraded readiness when persisted Stripe objects do not match authoritative money', async () => {
    const store = {
      checkHealth: vi.fn().mockResolvedValue(undefined),
      checkPaymentCatalog: vi.fn().mockResolvedValue(undefined),
      listActiveCatalogVariants: vi.fn().mockResolvedValue([{
        id: 'variant_face',
        name: 'Facial',
        priceMxnMinor: 100000,
        appointmentTypeId: 'type_hydra',
        appointmentTypeName: 'Hydrafacial',
        stripeProductId: 'prod_managed',
        stripeDepositPriceId: 'price_stale',
      }]),
    }
    const stripe = {
      products: { retrieve: vi.fn().mockResolvedValue({
        id: 'prod_managed', active: true, metadata: { bouclier_catalog: 'appointment_deposits', bouclier_appointment_type_id: 'type_hydra' },
      }) },
      prices: { retrieve: vi.fn().mockResolvedValue({
        id: 'price_stale', active: true, type: 'one_time', currency: 'mxn', unit_amount: 29999, product: 'prod_managed',
        metadata: { bouclier_catalog: 'appointment_deposits', bouclier_variant_id: 'variant_face', bouclier_deposit_rate_bps: '3000' },
      }) },
    }
    const service = createHealthService({
      store,
      stripe,
      paymentsEnabled: true,
      paymentsConfigured: true,
      environment: 'production',
      nodeVersion: 'v22.0.0',
    })

    await expect(service.check()).resolves.toMatchObject({
      status: 'degraded',
      payments: { enabled: true, configured: true, ready: false },
    })
    expect(stripe.prices.retrieve).toHaveBeenCalledWith('price_stale')
  })

  it('collapses concurrent catalog health checks into one Stripe verification', async () => {
    const fixture = readyCatalogFixture()
    let releaseProduct
    const productGate = new Promise((resolve) => { releaseProduct = resolve })
    fixture.stripe.products.retrieve.mockImplementation(async () => {
      await productGate
      return fixture.product
    })
    const service = createHealthService({
      ...fixture,
      paymentsEnabled: true,
      paymentsConfigured: true,
      environment: 'production',
      nodeVersion: 'v22.0.0',
    })

    const checks = [service.check(), service.check(), service.check()]
    try {
      await vi.waitFor(() => expect(fixture.stripe.products.retrieve).toHaveBeenCalledOnce())
    } finally {
      releaseProduct()
    }

    const results = await Promise.all(checks)
    expect(results.map(({ payments }) => payments.ready)).toEqual([true, true, true])
    expect(fixture.stripe.prices.retrieve).toHaveBeenCalledOnce()
  })

  it('reuses catalog readiness only until the bounded TTL expires', async () => {
    const fixture = readyCatalogFixture()
    let clock = 1_000
    const service = createHealthService({
      ...fixture,
      paymentsEnabled: true,
      paymentsConfigured: true,
      environment: 'production',
      catalogCacheTtlMs: 100,
      now: () => clock,
    })

    await service.check()
    await service.check()
    clock += 101
    await service.check()

    expect(fixture.stripe.products.retrieve).toHaveBeenCalledTimes(2)
    expect(fixture.stripe.prices.retrieve).toHaveBeenCalledTimes(2)
  })

  it('caches Stripe verification failures as degraded until the TTL permits a retry', async () => {
    const fixture = readyCatalogFixture()
    let clock = 1_000
    fixture.stripe.products.retrieve
      .mockRejectedValueOnce(new Error('sk_live_must_never_leak'))
      .mockResolvedValue(fixture.product)
    const service = createHealthService({
      ...fixture,
      paymentsEnabled: true,
      paymentsConfigured: true,
      environment: 'production',
      catalogCacheTtlMs: 100,
      now: () => clock,
    })

    const first = await service.check()
    const cached = await service.check()
    clock += 101
    const retried = await service.check()

    expect([first.status, cached.status, retried.status]).toEqual(['degraded', 'degraded', 'ok'])
    expect(fixture.stripe.products.retrieve).toHaveBeenCalledTimes(2)
    expect(JSON.stringify(first)).not.toContain('sk_live_must_never_leak')
  })
})
