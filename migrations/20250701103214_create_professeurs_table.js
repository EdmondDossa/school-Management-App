/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("professeurs");
  if (!exists) {
    await knex.schema.createTable("professeurs", function (table) {
      table.increments("NumProf").primary();
      table.string("NomProf").notNullable();
      table.string("PrenomsProf").notNullable();
      table.string("Sexe");
      table.string("Adresse");
      table.string("Telephone");
      table.string("Email");
      table.string("DateNaissance");
      table.string("LieuNaissance");
      table.string("Nationalite");
      table.integer("NumEtabli");

      // Foreign key
      table
        .foreign("NumEtabli")
        .references("NumEtabli")
        .inTable("etablissements");

      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("professeurs");
};
