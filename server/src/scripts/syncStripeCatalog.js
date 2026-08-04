import { createClient } from '@supabase/supabase-js'
import { loadConfig } from '../config.js'
import { createStripeClient } from '../services/stripeClient.js'
import { syncStripeCatalog } from '../services/stripeCatalogSync.js'
import { createSupabaseBookingStore } from '../services/supabaseBookingStore.js'

const config = loadConfig()
if (!config.paymentsEnabled) throw new Error('Set PAYMENTS_ENABLED=true before synchronizing Stripe')
if (
  config.stripeSecretKey.startsWith('sk_live_')
  && (process.env.STRIPE_CATALOG_ALLOW_LIVE !== 'true' || process.env.STRIPE_CREDENTIAL_ROTATED !== 'true')
) {
  throw new Error('Live catalog sync requires explicit confirmation of a rotated credential')
}

const stripe = createStripeClient(config.stripeSecretKey)
const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const store = createSupabaseBookingStore(supabase)
const summary = await syncStripeCatalog({ stripe, store })

console.log(JSON.stringify(summary))
