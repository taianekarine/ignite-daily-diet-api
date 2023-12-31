import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { z } from 'zod'
import { AppError } from '../utils/AppError'
import { checkSessionIdExists } from '../middlewares/checkSessionIdExists'

export const MealsRoutes = async (app: FastifyInstance) => {
  // Create meal
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const createMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        includedInDiet: z.boolean(),
      })

      const { name, description, includedInDiet } = createMealsBodySchema.parse(
        req.body,
      )

      let sessionId = req.cookies.sessionId

      if (!sessionId) {
        sessionId = randomUUID()

        reply.cookie('sessionId', sessionId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30-days
        })
      }

      await knex('mealHistory').insert({
        id: randomUUID(),
        name,
        description,
        includedInDiet,
        session_id: sessionId,
      })

      return reply.status(201).send({ name, description, includedInDiet })
    },
  )

  // Edit meal
  app.put(
    '/edit/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const createMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        includedInDiet: z.boolean(),
      })

      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(req.params)
      const { name, description, includedInDiet } = createMealsBodySchema.parse(
        req.body,
      )

      const sessionId = req.cookies.sessionId

      const checkSessionId = await knex('mealHistory')
        .where({
          session_id: sessionId,
        })
        .first()

      if (sessionId !== checkSessionId?.session_id) {
        throw new AppError('Unauthorized')
      }

      const [meal] = await knex('mealHistory').select('*').where({ id })

      meal.name = name ?? meal.name
      meal.description = description ?? meal.description
      meal.includedInDiet = includedInDiet ?? meal.includedInDiet

      await knex('mealHistory').where({ id }).update({
        name: meal.name,
        description: meal.description,
        includedInDiet: meal.includedInDiet,
      })

      return reply.status(201).send({ name, description, includedInDiet })
    },
  )

  // Delete meal
  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(req.params)

      const sessionId = req.cookies.sessionId

      const checkSessionId = await knex('mealHistory')
        .where({
          session_id: sessionId,
        })
        .first()

      if (sessionId !== checkSessionId?.session_id) {
        throw new AppError('Unauthorized')
      }

      await knex('mealHistory').where({ id }).delete()

      return reply.status(201).send('Meal deleted')
    },
  )

  // List all meals
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const { sessionId } = req.cookies

      const meals = await knex('mealHistory')
        .where({ session_id: sessionId })
        .select()

      return { meals }
    },
  )

  // List a meal
  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(req.params)

      const sessionId = req.cookies.sessionId

      const checkSessionId = await knex('mealHistory')
        .where({
          session_id: sessionId,
        })
        .first()

      if (sessionId !== checkSessionId?.session_id) {
        throw new AppError('Unauthorized')
      }

      const meals = await knex('mealHistory').where({ id }).select()

      return { meals }
    },
  )

  // Sumary
  app.get(
    '/summary',

    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const { sessionId } = req.cookies

      const [count] = await knex('mealHistory')
        .where({ session_id: sessionId })
        .count({ totalMeals: '*' })

      const [countMealsWithinTheDiet] = await knex('mealHistory')
        .where({ session_id: sessionId })
        .andWhere('includedInDiet', 1)
        .count({ totalMeals: '*' })

      const [countMealsOutsideOfTheDiet] = await knex('mealHistory')
        .where({ session_id: sessionId })
        .andWhere('includedInDiet', 0)
        .count({ totalMeals: '*' })

      const mealHistory = await knex('mealHistory').select('includedInDiet')
      const includedInDietString = mealHistory
        .map((record) => record.includedInDiet)
        .join('')

      const sequenceOfMealsWithinTheDiet = includedInDietString.split('0')
      const longestMealSequenceWithinTheDiet =
        sequenceOfMealsWithinTheDiet.reduce(
          (max, sequence) => Math.max(max, sequence.length),
          0,
        )

      return {
        count,
        countMealsWithinTheDiet,
        countMealsOutsideOfTheDiet,
        longestMealSequenceWithinTheDiet,
      }
    },
  )
}
