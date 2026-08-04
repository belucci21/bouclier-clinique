import { checkStripeCatalogReadiness } from './stripeCatalogSync.js'

export function createHealthService({
  store,
  stripe,
  paymentsEnabled,
  paymentsConfigured,
  environment,
  nodeVersion = process.version,
}) {
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
        try {
          await store.checkPaymentCatalog()
          await checkStripeCatalogReadiness({ stripe, store })
          paymentCatalogReady = true
        } catch {
          paymentCatalogReady = false
        }
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
