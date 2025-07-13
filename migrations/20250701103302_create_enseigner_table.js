/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists("enseigner", function (table) {
    table.increments("id").primary();
    table.integer("NumProf");
    table.integer("NumClass");
    table.integer("CodMat");
    table.string("Annee");
    table.integer("NumEtabli");
    table.foreign("NumProf").references("NumProf").inTable("professeurs");
    table.foreign("NumClass").references("NumClass").inTable("classes");
    table.foreign("CodMat").references("CodMat").inTable("matieres");
    table.foreign("Annee").references("Annee").inTable("annees_scolaires");
    table
      .foreign("NumEtabli")
      .references("NumEtabli")
      .inTable("etablissements");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("enseigner");
};
