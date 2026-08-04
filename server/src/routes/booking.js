import { Router } from 'express'

export function createBookingRouter({ bookingService }) {
  const router = Router()

  router.get('/options', async (_request, response, next) => {
    try {
      response.json(await bookingService.getOptions())
    } catch (error) {
      next(error)
    }
  })

  router.get('/availability', async (request, response, next) => {
    try {
      response.json(await bookingService.getAvailability(request.query))
    } catch (error) {
      next(error)
    }
  })

  router.post('/hold', async (request, response, next) => {
    try {
      const hold = await bookingService.createHold(request.body)
      response.status(201).json(hold)
    } catch (error) {
      next(error)
    }
  })

  router.post('/checkout-session', async (request, response, next) => {
    try {
      const session = await bookingService.createCheckoutSession(request.body)
      response.status(201).json(session)
    } catch (error) {
      next(error)
    }
  })

  router.get('/session/:id', async (request, response, next) => {
    try {
      response.json(await bookingService.getSession(request.params.id))
    } catch (error) {
      next(error)
    }
  })

  return router
}
