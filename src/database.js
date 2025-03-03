import { app } from 'electron';
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Chemin vers le dossier userData (persistant)
const userDataPath = app.getPath('userData');
// Chemin vers le dossier de la base de données
const dbDir = path.join(userDataPath, "resources/db");

// Créer le dossier db s'il n'existe pas
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Chemin de la base de données
const dbPath = path.join(dbDir, "school-management.db");
//const dbPath = path.join(dbDir, "school-management.db");

// Créer la connexion SQLite
const db = new sqlite3.Database(dbPath);

class Database {
    static async init(forceReset = false) {
        return new Promise((resolve, reject) => {
            const createTableQueries = [
                `CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    email TEXT UNIQUE,
                    password TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS classes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    promotion TEXT NOT NULL,
                    capacity INTEGER,
                    teacherId INTEGER,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
            ];

            db.serialize(() => {
                if (forceReset) {
                    const dropTableQueries = [
                        "DROP TABLE IF EXISTS classes",
                        "DROP TABLE IF EXISTS users"
                    ];
                    dropTableQueries.forEach(query => db.run(query));
                }

                createTableQueries.forEach(query => db.run(query));
                console.log("Base de données initialisée avec succès");
                resolve();
            });
        });
    }

    static query(sql, params = []) {
        return new Promise((resolve, reject) => {
            const isSelect = sql.trim().toUpperCase().startsWith("SELECT");
            if (isSelect) {
                db.all(sql, params, (error, rows) => {
                    if (error) reject(error);
                    else resolve(rows);
                });
            } else {
                db.run(sql, params, function (error) {
                    if (error) reject(error);
                    else resolve({ lastID: this.lastID, changes: this.changes });
                });
            }
        });
    }

    static close() {
        return new Promise((resolve, reject) => {
            db.close(error => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
}

export default Database;
