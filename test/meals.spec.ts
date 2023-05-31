import { execSync } from 'node:child_process'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

describe.skip('Meals routes', () => {
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

  it('should create a new meal', async () => {
    await request(app.server)
      .post('/users/signup')
      .send({
        name: 'John Doe',
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(201)

    const signinResponse = await request(app.server)
      .post('/users/signin')
      .send({
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(200)

    const cookie = signinResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Salada',
        date: new Date().toISOString(),
        isDiet: true,
      })
      .set('Cookie', cookie)
      .expect(201)
  })

  it('should get all meals from an user', async () => {
    await request(app.server)
      .post('/users/signup')
      .send({
        name: 'John Doe',
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(201)

    const signinResponse = await request(app.server)
      .post('/users/signin')
      .send({
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(200)

    const cookie = signinResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Salada',
        date: new Date().toISOString(),
        isDiet: true,
      })
      .set('Cookie', cookie)
      .expect(201)

    // await request(app.server)
    //   .post('/meals')
    //   .send({
    //     name: 'Hambuguer',
    //     description: 'X-Burguer',
    //     date: new Date().toISOString(),
    //     isDiet: false,
    //   })
    //   .set('Cookie', cookie)
    //   .expect(201)

    const response = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)
      .expect(200)

    expect(response.body.meals).toEqual([
      expect.objectContaining({
        name: 'Salada',
      }),
    ])
  })

  it('should get a meal from an user', async () => {
    await request(app.server)
      .post('/users/signup')
      .send({
        name: 'John Doe',
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(201)

    const signinResponse = await request(app.server)
      .post('/users/signin')
      .send({
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(200)

    const cookie = signinResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Salada',
        date: new Date().toISOString(),
        isDiet: true,
      })
      .set('Cookie', cookie)
      .expect(201)

    const response = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)
      .expect(200)

    const mealId = response.body.meals[0].id

    const mealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookie)
      .expect(200)

    expect(mealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Salada',
      }),
    )
  })

  it('should update a meal from an user', async () => {
    await request(app.server)
      .post('/users/signup')
      .send({
        name: 'John Doe',
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(201)

    const signinResponse = await request(app.server)
      .post('/users/signin')
      .send({
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(200)

    const cookie = signinResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Salada',
        date: new Date().toISOString(),
        isDiet: true,
      })
      .set('Cookie', cookie)
      .expect(201)

    const response = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)
      .expect(200)

    const mealId = response.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .send({
        name: 'Salada de frutas',
        description: 'Salada de frutas com banana, maçã e morango',
      })
      .set('Cookie', cookie)

    const mealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookie)
      .expect(200)

    expect(mealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Salada de frutas',
        description: 'Salada de frutas com banana, maçã e morango',
      }),
    )
  })

  it('should delete a meal from an user', async () => {
    await request(app.server)
      .post('/users/signup')
      .send({
        name: 'John Doe',
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(201)

    const signinResponse = await request(app.server)
      .post('/users/signin')
      .send({
        email: 'john@doe.com',
        password: '123456',
      })
      .expect(200)

    const cookie = signinResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Salada',
        date: new Date().toISOString(),
        isDiet: true,
      })
      .set('Cookie', cookie)
      .expect(201)

    const response = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)
      .expect(200)

    const mealId = response.body.meals[0].id

    await request(app.server).delete(`/meals/${mealId}`).set('Cookie', cookie)

    await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookie)
      .expect(404)
  })
})
