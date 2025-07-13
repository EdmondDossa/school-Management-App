/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists("eleves", function (table) {
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
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("eleves");
};
