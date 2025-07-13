/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists("matieres", function (table) {
    table.increments("CodMat").primary();
    table.string("NomMat").notNullable();
    table.integer("NumEtabli");
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
  return knex.schema.dropTable("matieres");
};
