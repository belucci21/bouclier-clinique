import { checkStripeCatalogReadiness } from './stripeCatalogSync.js'

export function createHealthService({
  store,
  stripe,
  paymentsEnabled,
  paymentsConfigured,
  environment,
  nodeVersion = process.version,
  catalogCacheTtlMs = 30_000,
  now = Date.now,
}) {
  const boundedCatalogCacheTtlMs = Math.min(Math.max(Number(catalogCacheTtlMs) || 30_000, 1), 60_000)
  let catalogCache = null
  let catalogCheckInFlight = null

  async function checkPaymentCatalog() {
    const currentTime = now()
    if (catalogCache && currentTime < catalogCache.expiresAt) return catalogCache.ready
    if (catalogCheckInFlight) return catalogCheckInFlight

    const check = (async () => {
      let ready = false
      try {
        await store.checkPaymentCatalog()
        await checkStripeCatalogReadiness({ stripe, store })
        ready = true
      } catch {
        ready = false
      }
      catalogCache = { ready, expiresAt: now() + boundedCatalogCacheTtlMs }
      return ready
    })()
    catalogCheckInFlight = check
    try {
      return await check
    } finally {
      if (catalogCheckInFlight === check) catalogCheckInFlight = null
    }
  }

  return {
    async check() {
      let supabaseReady = true
      try {
        await store.checkHealth()
      } catch {
        supabaseReady = false
      }

      let paymentCatalogReady = false
      if (supabaseReady && paymentsEnabled && paymentsConfigured) {
        paymentCatalogReady = await checkPaymentCatalog()
      }
      const paymentsReady = Boolean(
        paymentsEnabled && paymentsConfigured && supabaseReady && paymentCatalogReady
      )

      return {
        status: supabaseReady && (!paymentsEnabled || paymentsReady) ? 'ok' : 'degraded',
        runtime: { nodeVersion, environment },
        supabase: { configured: true, ready: supabaseReady },
        payments: {
          enabled: Boolean(paymentsEnabled),
          configured: Boolean(paymentsConfigured),
          ready: paymentsReady,
        },
      }
    },
  }
}
