import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { z } from 'zod'
import { hash } from 'bcrypt'
import { AppError } from '../utils/AppError'

export const UsersRoutes = async (app: FastifyInstance) => {
  // Register User

  app.post('/register', async (req, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
      weight: z.number(),
      height: z.number(),
    })

    const { name, email, password, weight, height } =
      createUserBodySchema.parse(req.body)

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
    })

    return reply.status(201).send({ name, email, password: hasedPassword })
  })
}
