/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .alterTable("cours", function (table) {
      table.dropForeign("NumEmploi");
      table.dropColumn("NumEmploi");
      table.dropColumn("HFin");
      table.integer("NBHeures").notNullable();
      table.integer("NumClass").unsigned().notNullable();
      table.string("Annee").notNullable();
      table.foreign("NumClass").references("NumClass").inTable("classes");
      table.foreign("Annee").references("Annee").inTable("annees_scolaires");
    })
    .then(() => {
      return knex.schema.dropTable("emploi_du_temps");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .createTableIfNotExists("emploi_du_temps", function (table) {
      table.increments("NumEmploi").primary();
      table.integer("NumClass");
      table.integer("NumEtabli");
      table.string("Annee");
      table.integer("NumProf");
      table.foreign("NumClass").references("NumClass").inTable("classes");
      table
        .foreign("NumEtabli")
        .references("NumEtabli")
        .inTable("etablissements");
      table.foreign("Annee").references("Annee").inTable("annees_scolaires");
      table.foreign("NumProf").references("NumProf").inTable("professeurs");
    })
    .then(() => {
      return knex.schema.alterTable("cours", function (table) {
        table.dropForeign("NumClass");
        table.dropForeign("Annee");
        table.dropColumn("NBHeures");
        table.dropColumn("NumClass");
        table.dropColumn("Annee");
        table.string("HFin").notNullable();
        table.integer("NumEmploi").unsigned().notNullable();
        table
          .foreign("NumEmploi")
          .references("NumEmploi")
          .inTable("emploi_du_temps");
      });
    });
};
