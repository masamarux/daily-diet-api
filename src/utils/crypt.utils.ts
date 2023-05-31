import bcrypt from 'bcrypt'
import { env } from '../env'

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, env.SALT_ROUNDS)
}

export const comparePassword = async (password: string, hash: string) => {
  bcrypt.compare(password, hash, (err, result) => {
    if (err) {
      console.error(err)
    }
    return result
  })
}
