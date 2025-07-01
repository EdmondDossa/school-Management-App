/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists("composer", function (table) {
    table.integer("NumIns");
    table.integer("CodMat");
    table.string("DateCompo");
    table.float("Note");
    table.string("Type").notNullable();
    table.integer("NumPeriode");
    table.primary(["NumIns", "CodMat", "DateCompo"]);
    table.foreign("NumIns").references("NumIns").inTable("inscriptions");
    table.foreign("CodMat").references("CodMat").inTable("matieres");
    table.foreign("NumPeriode").references("NumPeriode").inTable("periodes");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("composer");
};
