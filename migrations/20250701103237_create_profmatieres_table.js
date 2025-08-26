/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("profmatieres");
  if (!exists) {
    await knex.schema.createTable("profmatieres", function (table) {
      table.integer("NumProf");
      table.integer("CodMat");

      // Clé primaire composite
      table.primary(["NumProf", "CodMat"]);

      // Foreign keys
      table.foreign("NumProf").references("NumProf").inTable("professeurs");
      table.foreign("CodMat").references("CodMat").inTable("matieres");
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("profmatieres");
};
