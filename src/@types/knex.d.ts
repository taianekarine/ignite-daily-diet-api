// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password: string
      weight: number
      height: number
      created_at: string
      session_id?: string
    }
    mealHistory: {
      id: string
      name: string
      description: string
      includedInDiet: boolean
      created_at: string
      session_id?: string
    }
  }
}
