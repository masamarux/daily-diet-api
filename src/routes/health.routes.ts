import { FastifyInstance } from 'fastify'

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    return { message: 'ok' }
  })
}
