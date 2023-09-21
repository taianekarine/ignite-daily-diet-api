import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('users', ( table ) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('email').notNullable()
    table.text('password').notNullable()
    table.decimal('weight', 3, 2).notNullable()
    table.decimal('height', 1, 2).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTable('users')
}
