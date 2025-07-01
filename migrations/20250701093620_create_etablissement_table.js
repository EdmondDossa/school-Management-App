/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists("etablissements", function (table) {
    table.increments("NumEtabli").primary();
    table.string("NomEtabli").notNullable();
    table.string("Adresse");
    table.string("Telephone");
    table.string("Email");
    table.string("Logo");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("etablissements");
};
