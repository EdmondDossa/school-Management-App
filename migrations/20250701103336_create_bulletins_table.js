/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("bulletins");
  if (!exists) {
    await knex.schema.createTable("bulletins", function (table) {
      table.integer("NumIns");
      table.string("Periode");
      table.string("Rang");
      table.float("Moyenne");
      table.timestamp("created_at").defaultTo(knex.fn.now());

      // Clé primaire composite
      table.primary(["NumIns", "Periode"]);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("bulletins");
};
