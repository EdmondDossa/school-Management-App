/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists("professeurs", function (table) {
    table.increments("NumProf").primary();
    table.string("NomProf").notNullable();
    table.string("PrenomsProf").notNullable();
    table.string("Sexe");
    table.string("Adresse");
    table.string("Telephone");
    table.string("Email");
    table.string("DateNaissance");
    table.string("LieuNaissance");
    table.string("Nationalite");
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
  return knex.schema.dropTable("professeurs");
};
