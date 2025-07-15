/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Drop foreign key constraints from tables referencing etablissements
  await knex.schema.table("professeurs", function (table) {
    table.dropForeign("NumEtabli");
  });
  await knex.schema.table("matieres", function (table) {
    table.dropForeign("NumEtabli");
  });
  await knex.schema.table("coefficientsMatieres", function (table) {
    table.dropForeign("NumEtabli");
  });
  await knex.schema.table("enseigner", function (table) {
    table.dropForeign("NumEtabli");
  });
  await knex.schema.table("emploi_du_temps", function (table) {
    table.dropForeign("NumEtabli");
  });

  // Then, drop the NumEtabli column from all tables
  await knex.schema.table("professeurs", function (table) {
    table.dropColumn("NumEtabli");
  });
  await knex.schema.table("matieres", function (table) {
    table.dropColumn("NumEtabli");
  });
  await knex.schema.table("coefficientsMatieres", function (table) {
    table.dropColumn("NumEtabli");
  });
  await knex.schema.table("enseigner", function (table) {
    table.dropColumn("NumEtabli");
  });
  await knex.schema.table("emploi_du_temps", function (table) {
    table.dropColumn("NumEtabli");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // Add the NumEtabli column back to all tables and re-add foreign key constraints
  await knex.schema.table("professeurs", function (table) {
    table
      .integer("NumEtabli")
      .unsigned()
      .references("etablissements.NumEtabli");
  });
  await knex.schema.table("matieres", function (table) {
    table
      .integer("NumEtabli")
      .unsigned()
      .references("etablissements.NumEtabli");
  });
  await knex.schema.table("coefficientsMatieres", function (table) {
    table
      .integer("NumEtabli")
      .unsigned()
      .references("etablissements.NumEtabli");
  });
  await knex.schema.table("enseigner", function (table) {
    table
      .integer("NumEtabli")
      .unsigned()
      .references("etablissements.NumEtabli");
  });
  await knex.schema.table("emploi_du_temps", function (table) {
    table
      .integer("NumEtabli")
      .unsigned()
      .references("etablissements.NumEtabli");
  });
};
