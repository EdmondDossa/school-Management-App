/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists("composer", function (table) {
    table.integer("NumIns");
    table.integer("CodMat");
    table.timestamp("DateCompo").defaultTo(knex.fn.now());
    table.float("Note");
    table
      .string("Type")
      .notNullable()
      .checkIn(["I1", "I2", "I3", "D1", "D2", "D3"]);
    table
      .string("Periode")
      .checkIn([
        "1er Trimestre",
        "2ème Trimestre",
        "3ème Trimestre",
        "1er Semestre",
        "2ème Semestre",
      ]);
    table.primary(["NumIns", "CodMat", "Periode", "Type"]);
    table.foreign("NumIns").references("NumIns").inTable("inscriptions");
    table.foreign("CodMat").references("CodMat").inTable("matieres");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("composer");
};
