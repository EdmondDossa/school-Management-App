/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists(
    "bulletins",
    function (table) {
      table.integer("NumIns");
      table.string("Periode");
      table.string("Rang");
      table.float("Moyenne");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.primary(["NumIns","Periode"]);
    }
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("emploi_du_temps");
};
