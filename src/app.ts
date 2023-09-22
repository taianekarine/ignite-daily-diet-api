import fastify from 'fastify'
import { UsersRoutes } from './routes/users'
import { MealsRoutes } from './routes/meals'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.register(UsersRoutes, {
  prefix: 'users',
})

app.register(MealsRoutes, {
  prefix: 'meals',
})
