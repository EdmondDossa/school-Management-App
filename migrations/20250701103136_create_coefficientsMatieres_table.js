/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists(
    "coefficientsMatieres",
    function (table) {
      table.integer("CodMat");
      table.integer("Coef").notNullable();
      table.string("Annee");
      table.integer("NumClass");
      table.integer("NumEtabli");
      table.primary(["CodMat", "Annee", "NumClass"]);
      table.foreign("CodMat").references("CodMat").inTable("matieres");
      table.foreign("NumClass").references("NumClass").inTable("classes");
      table.foreign("Annee").references("Annee").inTable("annees_scolaires");
      table
        .foreign("NumEtabli")
        .references("NumEtabli")
        .inTable("etablissements");
    }
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("coefficientsMatieres");
};
