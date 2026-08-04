import express from 'express'
import { createBookingRouter } from './routes/booking.js'

function errorResponse(error) {
  return {
    error: {
      code: error.code || 'internal_error',
      message: error.expose ? error.message : 'No pudimos completar la solicitud',
      retryable: Boolean(error.retryable),
    },
  }
}

export function createApp({ bookingService, webhookHandler, healthService, allowedOrigin }) {
  const app = express()

  app.disable('x-powered-by')
  if (allowedOrigin) {
    app.use('/api', (request, response, next) => {
      const origin = request.get('Origin')
      if (origin === allowedOrigin) {
        response.set('Access-Control-Allow-Origin', allowedOrigin)
        response.set('Vary', 'Origin')
      }
      if (request.method === 'OPTIONS') {
        if (origin === allowedOrigin) {
          response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
          response.set('Access-Control-Allow-Headers', 'Content-Type')
        }
        response.sendStatus(204)
        return
      }
      next()
    })
  }
  if (healthService) {
    app.get('/api/health', async (_request, response, next) => {
      try {
        const health = await healthService.check()
        response.status(health.status === 'ok' ? 200 : 503).json(health)
      } catch (error) {
        next(error)
      }
    })
  }
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), webhookHandler)
  app.use(express.json({ limit: '32kb' }))
  app.use('/api/booking', createBookingRouter({ bookingService }))

  app.use((error, _request, response, _next) => {
    response.status(error.status || 500).json(errorResponse(error))
  })

  return app
}
