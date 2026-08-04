import { describe, expect, it } from 'vitest'
import { createStripeClient } from '../src/services/stripeClient.js'

describe('Stripe client', () => {
  it('pins the Clover API contract for catalog and Checkout calls', () => {
    class FakeStripe {
      constructor(secretKey, options) {
        this.secretKey = secretKey
        this.options = options
      }
    }

    const stripe = createStripeClient('sk_test_rotated_example', FakeStripe)

    expect(stripe).toMatchObject({
      secretKey: 'sk_test_rotated_example',
      options: { apiVersion: '2026-02-25.clover' },
    })
  })
})
