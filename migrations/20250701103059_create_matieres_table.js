/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("matieres");
  if (!exists) {
    await knex.schema.createTable("matieres", function (table) {
      table.increments("CodMat").primary();
      table.string("NomMat").notNullable();
      table.integer("NumEtabli");

      // Foreign key
      table
        .foreign("NumEtabli")
        .references("NumEtabli")
        .inTable("etablissements");
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("matieres");
};
