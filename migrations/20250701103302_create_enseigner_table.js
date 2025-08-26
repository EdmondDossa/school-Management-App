/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("enseigner");
  if (!exists) {
    await knex.schema.createTable("enseigner", function (table) {
      table.increments("id").primary();
      table.integer("NumProf");
      table.integer("NumClass");
      table.integer("CodMat");
      table.string("Annee");
      table.integer("NumEtabli");

      // Foreign keys
      table.foreign("NumProf").references("NumProf").inTable("professeurs");
      table.foreign("NumClass").references("NumClass").inTable("classes");
      table.foreign("CodMat").references("CodMat").inTable("matieres");
      table.foreign("Annee").references("Annee").inTable("annees_scolaires");
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
  await knex.schema.dropTableIfExists("enseigner");
};
