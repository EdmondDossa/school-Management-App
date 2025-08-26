/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("classes");
  if (!exists) {
    await knex.schema.createTable("classes", function (table) {
      table.increments("NumClass").primary();
      table.string("NomClass").notNullable();
      table.string("Promotion").notNullable();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("classes");
};
