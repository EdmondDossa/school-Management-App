/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("inscriptions");
  if (!exists) {
    await knex.schema.createTable("inscriptions", function (table) {
      table.increments("NumIns").primary();
      table.timestamp("DateIns").notNullable().defaultTo(knex.fn.now());
      table
        .string("Statut")
        .notNullable()
        .checkIn(["Nouveau", "Doublant", "Redoublant"]);
      table.string("Matricule");
      table.integer("NumClass");
      table.string("AnneeScolaire");

      // FKs
      table.foreign("Matricule").references("Matricule").inTable("eleves");
      table.foreign("NumClass").references("NumClass").inTable("classes");
      table
        .foreign("AnneeScolaire")
        .references("Annee")
        .inTable("annees_scolaires");

      // Unicité d'inscription par élève et année
      table.unique(["Matricule", "AnneeScolaire"]);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("inscriptions");
};
