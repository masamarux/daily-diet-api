import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.uuid('user_id').references('id').inTable('users').notNullable()
    table.string('name').notNullable()
    table.string('description')
    table.dateTime('date').notNullable()
    table.boolean('is_diet').defaultTo(false)
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', (table) => {
    table.dropForeign('user_id')
  })
  await knex.schema.dropTable('meals')
}
