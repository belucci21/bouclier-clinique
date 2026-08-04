import Stripe from 'stripe'

export function createStripeClient(secretKey, StripeConstructor = Stripe) {
  return new StripeConstructor(secretKey, { apiVersion: '2026-02-25.clover' })
}
