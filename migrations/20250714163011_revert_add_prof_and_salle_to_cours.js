/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("cours", function (table) {
    table.dropForeign("NumProf");
    table.dropColumn("NumProf");
    table.dropColumn("Salle");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("cours", function (table) {
    table.integer("NumProf").unsigned().nullable();
    table.foreign("NumProf").references("NumProf").inTable("professeurs");
    table.string("Salle").nullable();
  });
};
