import { knex as setup, Knex } from 'knex'
import { env } from './env'

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === 'sqlite3'
      ? {
          filename: env.DATABASE_URL,
        }
      : env.DATABASE_URL,
  migrations: {
    directory: './db/migrations',
    extension: 'ts',
  },
  useNullAsDefault: true,
}

export const knex = setup(config)
