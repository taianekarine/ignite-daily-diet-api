import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { z } from 'zod'
import { hash, compare } from 'bcrypt'
import { AppError } from '../utils/AppError'

export const UsersRoutes = async (app: FastifyInstance) => {
  // Register User
  app.post('/register', async (req, reply) => {
    const registerUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
      weight: z.number(),
      height: z.number(),
    })

    const { name, email, password, weight, height } =
      registerUserBodySchema.parse(req.body)

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30-days
      })
    }

    const checkUserExists = await knex
      .select('*')
      .from('users')
      .where('email', email)
      .first()

    if (checkUserExists) {
      throw new AppError('E-mail inválido para cadastrar o usuário')
    }

    const hasedPassword = await hash(password, 8)

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password: hasedPassword,
      weight,
      height,
      session_id: sessionId,
    })

    return reply.status(201).send({ name, email, password: hasedPassword })
  })

  // Login
  app.post('/login', async (req, reply) => {
    const userLoginSchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    const { email, password } = userLoginSchema.parse(req.body)

    const user = await knex('Users').where({ email }).first()

    if (!user) {
      throw new AppError('E-mail e/ou senha incorretos')
    }

    const passwordMatched = await compare(password, user.password)

    if (!passwordMatched) {
      throw new AppError('E-mail e/ou senha incorretos')
    }

    return reply.status(201).send({ user })
  })
}
