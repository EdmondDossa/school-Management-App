/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("utilisateurs");
  if (!exists) {
    await knex.schema.createTable("utilisateurs", function (table) {
      table.increments("id").primary();
      table.string("username").notNullable().unique();
      table.string("password").notNullable();
      table.string("role").notNullable();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("utilisateurs");
};
