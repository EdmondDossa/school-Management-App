/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists(
    "emploi_du_temps",
    function (table) {
      table.increments("NumEmploi").primary();
      table.integer("NumClass");
      table.integer("NumEtabli");
      table.string("Annee");
      table.integer("NumProf");
      table.foreign("NumClass").references("NumClass").inTable("classes");
      table
        .foreign("NumEtabli")
        .references("NumEtabli")
        .inTable("etablissements");
      table.foreign("Annee").references("Annee").inTable("annees_scolaires");
      table.foreign("NumProf").references("NumProf").inTable("professeurs");
    }
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("emploi_du_temps");
};
