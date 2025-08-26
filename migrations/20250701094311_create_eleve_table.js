/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("eleves");
  if (!exists) {
    await knex.schema.createTable("eleves", function (table) {
      table.string("Matricule").primary();
      table.string("Nom").notNullable();
      table.string("Prenoms").notNullable();
      table.string("Sexe");
      table.string("DateNaissance");
      table.string("LieuNaissance");
      table.string("Nationalite");
      table.string("ContactParent");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("eleves");
};
