// Update with your config settings.

/**
 * @type { Object.<string, import('knex').Knex.Config> }
 */
module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./resources/db/school-manager.db",
    },
    useNullAsDefault: true,
    migrations: {
      directory: "./migrations",
    },
  },

  production: {
    client: "sqlite3",
    connection: {
      filename: "./resources/db/school-manager.db",
    },
    useNullAsDefault: true,
    migrations: {
      directory: "./migrations",
    },
  },
};
