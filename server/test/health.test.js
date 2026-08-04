import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../src/app.js'

describe('GET /api/health', () => {
  it('allows preflight only from the configured public web origin', async () => {
    const app = createApp({
      bookingService: {},
      webhookHandler: vi.fn(),
      allowedOrigin: 'https://bouclier-clinique.com',
    })

    const allowed = await request(app)
      .options('/api/booking/options')
      .set('Origin', 'https://bouclier-clinique.com')
      .set('Access-Control-Request-Method', 'GET')
    const denied = await request(app)
      .options('/api/booking/options')
      .set('Origin', 'https://attacker.example')
      .set('Access-Control-Request-Method', 'GET')

    expect(allowed.status).toBe(204)
    expect(allowed.headers['access-control-allow-origin']).toBe('https://bouclier-clinique.com')
    expect(denied.headers).not.toHaveProperty('access-control-allow-origin')
  })

  it('reports runtime, Supabase, and safely-disabled payments without exposing configuration values', async () => {
    const app = createApp({
      bookingService: {},
      webhookHandler: vi.fn(),
      healthService: {
        check: vi.fn().mockResolvedValue({
          status: 'ok',
          runtime: { nodeVersion: 'v22.0.0', environment: 'test' },
          supabase: { configured: true, ready: true },
          payments: { enabled: false, configured: false, ready: false },
        }),
      },
    })

    const result = await request(app).get('/api/health')

    expect(result.status).toBe(200)
    expect(result.body).toEqual({
      status: 'ok',
      runtime: { nodeVersion: 'v22.0.0', environment: 'test' },
      supabase: { configured: true, ready: true },
      payments: { enabled: false, configured: false, ready: false },
    })
    expect(JSON.stringify(result.body)).not.toContain('service-role')
    expect(JSON.stringify(result.body)).not.toContain('sk_')
  })

  it('returns service unavailable when Supabase is not ready', async () => {
    const app = createApp({
      bookingService: {},
      webhookHandler: vi.fn(),
      healthService: {
        check: vi.fn().mockResolvedValue({
          status: 'degraded',
          runtime: { nodeVersion: 'v22.0.0', environment: 'test' },
          supabase: { configured: true, ready: false },
          payments: { enabled: true, configured: true, ready: true },
        }),
      },
    })

    const result = await request(app).get('/api/health')

    expect(result.status).toBe(503)
    expect(result.body.status).toBe('degraded')
  })
})
