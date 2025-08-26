/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("coefficientsMatieres");
  if (!exists) {
    await knex.schema.createTable("coefficientsMatieres", function (table) {
      table.integer("CodMat");
      table.integer("Coef").notNullable();
      table.string("Annee");
      table.integer("NumClass");
      table.integer("NumEtabli");

      // Clé primaire composite
      table.primary(["CodMat", "Annee", "NumClass"]);

      // Foreign keys
      table.foreign("CodMat").references("CodMat").inTable("matieres");
      table.foreign("NumClass").references("NumClass").inTable("classes");
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
  await knex.schema.dropTableIfExists("coefficientsMatieres");
};
