/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists("profmatieres", function (table) {
    table.integer("NumProf");
    table.integer("CodMat");
    table.primary(["NumProf", "CodMat"]);
    table.foreign("NumProf").references("NumProf").inTable("professeurs");
    table.foreign("CodMat").references("CodMat").inTable("matieres");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("profmatieres");
};
