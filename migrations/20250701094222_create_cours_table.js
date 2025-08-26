/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("cours");
  if (!exists) {
    await knex.schema.createTable("cours", function (table) {
      table.increments("NumCours").primary();
      table.string("HDebut").notNullable();
      table.string("HFin").notNullable();
      table.string("Jour").notNullable();
      table.integer("CodMat");
      table.integer("NumEmploi");

      // Foreign keys
      table.foreign("CodMat").references("CodMat").inTable("matieres");
      table
        .foreign("NumEmploi")
        .references("NumEmploi")
        .inTable("emploi_du_temps");
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("cours");
};
