import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('mealHistory', ( table ) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.boolean('includedInDiet').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTable('mealHistory')
}
