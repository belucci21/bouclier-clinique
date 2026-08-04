export function createStripeWebhookHandler({ stripe, webhookSecret, bookingService }) {
  return async function stripeWebhook(request, response) {
    let event
    try {
      event = stripe.webhooks.constructEvent(request.body, request.get('Stripe-Signature'), webhookSecret)
    } catch {
      response.status(400).json({ error: { code: 'invalid_signature', message: 'Firma de Stripe inválida', retryable: false } })
      return
    }

    try {
      const result = await bookingService.processWebhook(event)
      response.json({ received: true, duplicate: Boolean(result?.duplicate) })
    } catch {
      response.status(500).json({ error: { code: 'webhook_processing_failed', message: 'No se pudo procesar el evento', retryable: true } })
    }
  }
}
