import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import crypto from 'crypto'
import { checkTokenExists } from '../middlewares/check-token-exists'
import { TokenPayload } from '../middlewares/types'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const token = request.cookies.token
    if (!token) {
      return reply.status(401).send({ message: 'unauthorized' })
    }
    const authData: TokenPayload | null = app.jwt.decode(token)
    if (!authData) {
      return reply.status(401).send({ message: 'unauthorized' })
    }

    const bodySchema = z.object({
      name: z.string().min(1).max(255),
      description: z.string().max(255).optional(),
      date: z.coerce.date(),
      isDiet: z.boolean().optional(),
    })
    const body = bodySchema.safeParse(request.body)
    if (!body.success) {
      return reply
        .status(400)
        .send({ message: 'invalid body', errors: body.error.format() })
    }

    const { name, description, date, isDiet } = body.data

    await knex('meals').insert({
      id: crypto.randomUUID(),
      user_id: authData.id,
      name,
      description,
      date,
      is_diet: isDiet,
    })

    return reply.status(201).send()
  })

  app.get(
    '/',
    {
      preHandler: [checkTokenExists],
    },
    async (request, reply) => {
      const token = request.cookies.token
      if (!token) {
        return reply.status(401).send({ message: 'unauthorized' })
      }

      const authData: TokenPayload | null = app.jwt.decode(token)
      if (!authData) {
        return reply.status(401).send({ message: 'unauthorized' })
      }

      const meals = await knex('meals').where({ user_id: authData.id })

      if (!meals.length) {
        return reply.status(404).send({ message: 'meals not found' })
      }

      return { meals }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkTokenExists],
    },
    async (request, reply) => {
      const paramsSchema = z.object({
        id: z.string(),
      })
      const params = paramsSchema.safeParse(request.params)
      if (!params.success) {
        return reply
          .status(400)
          .send({ message: 'invalid params', errors: params.error.format() })
      }
      const { id } = params.data

      const token = request.cookies.token
      if (!token) {
        return reply.status(401).send({ message: 'unauthorized' })
      }

      const authData: TokenPayload | null = app.jwt.decode(token)
      if (!authData) {
        return reply.status(401).send({ message: 'unauthorized' })
      }

      const meal = await knex('meals').where({ id, user_id: authData.id })

      if (!meal.length) {
        return reply.status(404).send({ message: 'meal not found' })
      }

      return { meal: meal[0] }
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkTokenExists],
    },
    async (request, reply) => {
      const paramsSchema = z.object({
        id: z.string(),
      })
      const params = paramsSchema.safeParse(request.params)
      if (!params.success) {
        return reply
          .status(400)
          .send({ message: 'invalid params', errors: params.error.format() })
      }
      const { id } = params.data

      const token = request.cookies.token
      if (!token) {
        return reply.status(401).send({ message: 'unauthorized' })
      }

      const authData: TokenPayload | null = app.jwt.decode(token)
      if (!authData) {
        return reply.status(401).send({ message: 'unauthorized' })
      }

      const bodySchema = z.object({
        name: z.string().min(1).max(255).optional(),
        description: z.string().max(255).optional(),
        date: z.coerce.date().optional(),
        isDiet: z.boolean().optional(),
      })
      const body = bodySchema.safeParse(request.body)
      if (!body.success) {
        return reply
          .status(400)
          .send({ message: 'invalid body', errors: body.error.format() })
      }

      const { name, description, date, isDiet } = body.data

      await knex('meals')
        .update({
          name,
          description,
          date,
          is_diet: isDiet,
        })
        .where({ id, user_id: authData.id })
      return reply.status(204).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkTokenExists],
    },
    async (request, reply) => {
      const paramsSchema = z.object({
        id: z.string(),
      })
      const params = paramsSchema.safeParse(request.params)
      if (!params.success) {
        return reply
          .status(400)
          .send({ message: 'invalid params', errors: params.error.format() })
      }
      const { id } = params.data

      const token = request.cookies.token
      if (!token) {
        return reply.status(401).send({ message: 'unauthorized' })
      }

      const authData: TokenPayload | null = app.jwt.decode(token)
      if (!authData) {
        return reply.status(401).send({ message: 'unauthorized' })
      }

      await knex('meals').delete().where({ id, user_id: authData.id })
      return reply.status(204).send()
    },
  )
}
