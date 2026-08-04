import { createClient } from '@supabase/supabase-js'
import express from 'express'
import Stripe from 'stripe'
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { createStripeWebhookHandler } from './routes/stripeWebhook.js'
import { createBookingService } from './services/bookingService.js'
import { createSupabaseBookingStore } from './services/supabaseBookingStore.js'

const config = loadConfig()
const stripe = new Stripe(config.stripeSecretKey)
const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const store = createSupabaseBookingStore(supabase)
const bookingService = createBookingService({ store, stripe, publicWebUrl: config.publicWebUrl })
const webhookHandler = createStripeWebhookHandler({ stripe, webhookSecret: config.stripeWebhookSecret, bookingService })
const app = createApp({ bookingService, webhookHandler })

app.use(express.static('public'))
app.listen(config.port, () => {
  console.log(`Bouclier booking API listening on ${config.port}`)
})
