import fastify from 'fastify'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import { env } from './env'
import { healthRoutes } from './routes/health.routes'
import { usersRoutes } from './routes/users.routes'
import { mealsRoutes } from './routes/meals.routes'
import { checkTokenExists } from './middlewares/check-token-exists'

export const app = fastify()

app.register(cookie)
app.register(jwt, {
  secret: env.JWT_SECRET,
})

app.register(healthRoutes, { prefix: '/health' })
app.register(usersRoutes, { prefix: '/users' })
app.register(mealsRoutes, { prefix: '/meals', preHandler: [checkTokenExists] })
