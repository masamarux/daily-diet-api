import { describe, beforeAll, afterAll, beforeEach, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('User routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should signup an new user', async () => {
    await request(app.server)
      .post('/users/signup')
      .send({
        name: 'John Doe',
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(201)
  })

  it('should sign in an user', async () => {
    await request(app.server)
      .post('/users/signup')
      .send({
        name: 'John Doe',
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(201)

    await request(app.server)
      .post('/users/signin')
      .send({
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(200)
  })

  it('should get metrics from a user', async () => {
    await request(app.server).post('/users/signup').send({
      name: 'John Doe',
      email: 'john@doe.com',
      password: '123456',
    })

    const signinResponse = await request(app.server)
      .post('/users/signin')
      .send({
        email: 'john@doe.com',
        password: '123456',
      })

    const cookie = signinResponse.get('Set-Cookie')

    await Promise.all([
      request(app.server)
        .post('/meals')
        .send({
          name: 'Hambuguer',
          description: 'X-Burguer',
          date: '2023-05-30T19:01:06.031Z',
          isDiet: false,
        })
        .set('Cookie', cookie),
      request(app.server)
        .post('/meals')
        .send({
          name: 'Sanduiche',
          date: '2023-05-29T18:01:06.031Z',
          isDiet: true,
        })
        .set('Cookie', cookie),
      request(app.server)
        .post('/meals')
        .send({
          name: 'Salada',
          date: '2023-05-30T19:01:06.031Z',
          isDiet: true,
        })
        .set('Cookie', cookie),
      request(app.server)
        .post('/meals')
        .send({
          name: 'Salada de Frutas',
          date: '2023-05-28T19:01:06.031Z',
          isDiet: true,
        })
        .set('Cookie', cookie),
    ])

    const response = await request(app.server)
      .get('/users/metrics')
      .set('Cookie', cookie)

    expect(response.body.metrics).toEqual({
      total: 4,
      diet: 3,
      notDiet: 1,
      bestSequence: 3,
    })
  })
})
