/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists("inscriptions", function (table) {
    table.increments("NumIns").primary();
    table.timestamp("DateIns").notNullable().defaultTo(knex.fn.now());
    table
      .string("Statut")
      .notNullable()
      .checkIn(["Nouveau", "Doublant", "Redoublant"]);
    table.string("Matricule");
    table.integer("NumClass");
    table.string("AnneeScolaire");
    table.foreign("Matricule").references("Matricule").inTable("eleves");
    table.foreign("NumClass").references("NumClass").inTable("classes");
    table
      .foreign("AnneeScolaire")
      .references("Annee")
      .inTable("annees_scolaires");
    table.unique(["Matricule","AnneeScolaire"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("inscriptions");
};
