import { createClient } from '@supabase/supabase-js'
import express from 'express'
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { createStripeWebhookHandler } from './routes/stripeWebhook.js'
import { createBookingService } from './services/bookingService.js'
import { createHealthService } from './services/healthService.js'
import { createStripeClient } from './services/stripeClient.js'
import { createSupabaseBookingStore } from './services/supabaseBookingStore.js'

const config = loadConfig()
const stripe = config.paymentsEnabled ? createStripeClient(config.stripeSecretKey) : null
const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const store = createSupabaseBookingStore(supabase)
const bookingService = createBookingService({
  store,
  stripe,
  publicWebUrl: config.publicWebUrl,
  paymentsEnabled: config.paymentsEnabled,
})
const webhookHandler = config.paymentsEnabled
  ? createStripeWebhookHandler({ stripe, webhookSecret: config.stripeWebhookSecret, bookingService })
  : (_request, response) => response.status(503).json({
      error: { code: 'payments_disabled', message: 'Online payments are disabled', retryable: false },
    })
const healthService = createHealthService({
  store,
  paymentsEnabled: config.paymentsEnabled,
  paymentsConfigured: config.paymentsConfigured,
  environment: config.environment,
})
const app = createApp({
  bookingService,
  webhookHandler,
  healthService,
  allowedOrigin: config.allowedOrigin,
})

app.use(express.static('public'))
app.listen(config.port, () => {
  console.log(`Bouclier booking API listening on ${config.port}`)
})
