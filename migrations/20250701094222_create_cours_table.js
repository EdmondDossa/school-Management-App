/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists("cours", function (table) {
    table.increments("NumCours").primary();
    table.string("HDebut").notNullable();
    table.string("HFin").notNullable();
    table.string("Jour").notNullable();
    table.integer("CodMat");
    table.integer("NumEmploi");
    table.foreign("CodMat").references("CodMat").inTable("matieres");
    table
      .foreign("NumEmploi")
      .references("NumEmploi")
      .inTable("emploi_du_temps");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("cours");
};
