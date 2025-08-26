/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("emploi_du_temps");
  if (!exists) {
    await knex.schema.createTable("emploi_du_temps", function (table) {
      table.increments("NumEmploi").primary();
      table.integer("NumClass");
      table.integer("NumEtabli");
      table.string("Annee");
      table.integer("NumProf");

      // Foreign keys
      table.foreign("NumClass").references("NumClass").inTable("classes");
      table
        .foreign("NumEtabli")
        .references("NumEtabli")
        .inTable("etablissements");
      table.foreign("Annee").references("Annee").inTable("annees_scolaires");
      table.foreign("NumProf").references("NumProf").inTable("professeurs");
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("emploi_du_temps");
};
