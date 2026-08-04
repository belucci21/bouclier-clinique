import { describe, expect, it, vi } from 'vitest'
import { createHealthService } from '../src/services/healthService.js'

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
})
