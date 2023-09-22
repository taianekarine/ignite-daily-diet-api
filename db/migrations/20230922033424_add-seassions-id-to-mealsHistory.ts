import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable('mealHistory', ( table ) => {
    table.uuid('session_id').after('id').index()
  })
}

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable('mealHistory', (table) => {
    table.dropColumn('session_id')
  })
}
