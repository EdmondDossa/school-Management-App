/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists(
    "annees_scolaires",
    function (table) {
      table.increments("id").primary();
      table.string("Annee").notNullable().unique();
      table.string("DateDebut").notNullable();
      table.string("DateFin").notNullable();
      table.string("Statut").defaultTo("EnCours");
      table.string("Periodicite").notNullable();
    }
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("annees_scolaires");
};
