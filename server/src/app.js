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

export function createApp({ bookingService, webhookHandler }) {
  const app = express()

  app.disable('x-powered-by')
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), webhookHandler)
  app.use(express.json({ limit: '32kb' }))
  app.use('/api/booking', createBookingRouter({ bookingService }))

  app.use((error, _request, response, _next) => {
    response.status(error.status || 500).json(errorResponse(error))
  })

  return app
}
