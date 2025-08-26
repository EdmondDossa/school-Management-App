/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("etablissements");
  if (!exists) {
    await knex.schema.createTable("etablissements", function (table) {
      table.increments("NumEtabli").primary();
      table.string("NomEtabli").notNullable();
      table.string("Adresse");
      table.string("Telephone");
      table.string("Email");
      table.string("Logo");
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("etablissements");
};
