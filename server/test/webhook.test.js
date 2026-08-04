import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../src/app.js'
import { createStripeWebhookHandler } from '../src/routes/stripeWebhook.js'

describe('Stripe webhook', () => {
  it('rechaza firmas inválidas', async () => {
    const stripe = { webhooks: { constructEvent: vi.fn(() => { throw new Error('bad signature') }) } }
    const handler = createStripeWebhookHandler({ stripe, webhookSecret: 'whsec_test', bookingService: {} })
    const app = createApp({ bookingService: {}, webhookHandler: handler })

    const result = await request(app).post('/api/stripe/webhook').set('Stripe-Signature', 'bad').send('{}')

    expect(result.status).toBe(400)
  })

  it('procesa eventos repetidos de forma idempotente', async () => {
    const event = { id: 'evt_1', type: 'checkout.session.completed', data: { object: { id: 'cs_1', metadata: { booking_hold_id: 'hold_1' } } } }
    const stripe = { webhooks: { constructEvent: vi.fn(() => event) } }
    const bookingService = { processWebhook: vi.fn().mockResolvedValueOnce({ duplicate: false }).mockResolvedValueOnce({ duplicate: true }) }
    const handler = createStripeWebhookHandler({ stripe, webhookSecret: 'whsec_test', bookingService })
    const app = createApp({ bookingService: {}, webhookHandler: handler })

    expect((await request(app).post('/api/stripe/webhook').set('Stripe-Signature', 'sig').send('{}')).status).toBe(200)
    expect((await request(app).post('/api/stripe/webhook').set('Stripe-Signature', 'sig').send('{}')).status).toBe(200)
    expect(bookingService.processWebhook).toHaveBeenCalledTimes(2)
  })
})
