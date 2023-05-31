import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import crypto from 'crypto'
import { knex } from '../database'
import { compare } from 'bcrypt'
import { checkTokenExists } from '../middlewares/check-token-exists'
import { hashPassword } from '../utils/crypt.utils'
import { TokenPayload } from '../middlewares/types'
import { getBestSequenceOfDateInArray } from '../utils/date.utils'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/signup', async (request, reply) => {
    const bodySchema = z.object({
      name: z.string().min(4).max(32),
      email: z.string().email(),
      password: z.string().min(4).max(32),
    })
    const body = bodySchema.safeParse(request.body)

    if (!body.success) {
      return reply.status(400).send({ message: 'invalid body' })
    }

    const { name, email, password } = body.data

    const passwordHashed = await hashPassword(password)

    await knex('users').insert({
      id: crypto.randomUUID(),
      name,
      email,
      password: passwordHashed,
    })

    return reply.status(201).send()
  })

  app.post('/signin', async (request, reply) => {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(4).max(32),
    })

    const body = bodySchema.safeParse(request.body)

    if (!body.success) {
      return reply.status(400).send({ message: 'invalid body' })
    }

    const { email, password } = body.data

    const user = await knex('users').where({ email }).first()

    if (!user) {
      return reply.status(401).send({ message: 'authentication error' })
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      return reply.status(401).send({ message: 'authentication error' })
    }

    const token = app.jwt.sign({ id: user.id })

    return reply
      .cookie('token', token, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
      .status(200)
      .send()
  })

  app.get(
    '/metrics',
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

      const user = await knex('users').where({ id: authData.id }).first()

      if (!user) {
        return reply.status(401).send({ message: 'unauthorized' })
      }

      const [
        totalMeals,
        totalMealsWithDiets,
        totalMealsWithoutDiets,
        dietList,
      ] = await Promise.all([
        knex('meals').count('id as count').where({ user_id: user.id }).first(),
        knex('meals')
          .count('id as count')
          .where({ user_id: user.id, is_diet: true })
          .first(),
        knex('meals')
          .count('id as count')
          .where({ user_id: user.id, is_diet: false })
          .first(),
        knex('meals')
          .where({ user_id: user.id, is_diet: true })
          .select('*')
          .orderBy('date', 'asc'),
      ])

      const dateListFromDiets = dietList.map((diet) => new Date(diet.date))
      const bestSequence = getBestSequenceOfDateInArray(dateListFromDiets)

      return {
        metrics: {
          total: totalMeals ? totalMeals.count : 0,
          diet: totalMealsWithDiets ? totalMealsWithDiets.count : 0,
          notDiet: totalMealsWithoutDiets ? totalMealsWithoutDiets.count : 0,
          bestSequence,
        },
      }
    },
  )
}
