const knex = require("knex");
const knexConfig = require("../../knexfile");

const db = knex(knexConfig.development);

async function initializeDatabase() {
  try {
    await db.migrate.latest();
    console.log("Migrations ran successfully.");
  } catch (error) {
    console.error("Error running migrations:", error);
  }
}

module.exports = { db, initializeDatabase };
