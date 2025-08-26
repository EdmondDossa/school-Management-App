/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("composer");
  if (!exists) {
    await knex.schema.createTable("composer", function (table) {
      table.integer("NumIns");
      table.integer("CodMat");
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
      table.timestamp("enregistree_le").defaultTo(knex.fn.now());

      // Composite primary key
      table.primary(["NumIns", "CodMat", "Periode", "Type"]);

      // Foreign keys
      table.foreign("NumIns").references("NumIns").inTable("inscriptions");
      table.foreign("CodMat").references("CodMat").inTable("matieres");
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("composer");
};
