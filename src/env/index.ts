import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  HOST: z.string().min(1).default('localhost'),
  DATABASE_CLIENT: z.enum(['pg', 'sqlite3']).default('sqlite3'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.string(),
  SALT_ROUNDS: z.coerce.number().default(10),
  JWT_SECRET: z.string().min(1),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('Invalid environment variables: ', _env.error.format())

  throw new Error('Invalid environment variables!')
}

export const env = _env.data
