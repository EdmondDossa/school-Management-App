/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("annees_scolaires");
  if (!exists) {
    await knex.schema.createTable("annees_scolaires", function (table) {
      table.increments("id").primary();
      table.string("Annee").notNullable().unique();
      table.string("DateDebut").notNullable();
      table.string("DateFin").notNullable();
      table.string("Statut").defaultTo("EnCours");
      table.string("Periodicite").notNullable();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("annees_scolaires");
};
