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
      sessions_id?: string
    }
  }
}
