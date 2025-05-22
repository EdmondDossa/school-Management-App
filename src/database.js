import { app } from "electron";
import { is } from "@electron-toolkit/utils";

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Chemin vers le dossier userData (persistant)
const appDataPath = app.getAppPath();
// Chemin vers le dossier de la base de donnees
const dbDir = path.join(appDataPath, "resources/db");

// Creer le dossier db s'il n'existe pas
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Chemin de la base de donnees
const dbPath = is.dev
  ? path.join(path.join(dbDir, "/school-management.db"))
  : path
      .join(__dirname, "../../resources/db/school-management.db")
      .replace("app.asar", "app.asar.unpacked");
//const dbPath = path.join(dbDir, "school-management.db");

// Creer la connexion SQLite
const db = new sqlite3.Database(dbPath);

class Database {
  static async initTables() {
    return new Promise((resolve, reject) => {
      const createTableQueries = [
      `CREATE TABLE IF NOT EXISTS etablissements (
                    NumEtabli INTEGER PRIMARY KEY AUTOINCREMENT,
                    NomEtabli TEXT NOT NULL,
                    Adresse TEXT,
                    Telephone TEXT,
                    Logo TEXT,
                    Email TEXT
    );`,

        `CREATE TABLE IF NOT EXISTS annees_scolaires (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Annee TEXT NOT NULL,
                    DateDebut TEXT NOT NULL,
                    DateFin TEXT NOT NULL,
                    Periodicite TEXT NOT NULL CHECK(Periodicite IN ('Semestre', 'Trimestre')),
                    NumEtabli INTEGER,
                    FOREIGN KEY (NumEtabli) REFERENCES etablissements(NumEtabli)
                );`,



        `CREATE TABLE IF NOT EXISTS classes (
                    NumClass INTEGER PRIMARY KEY AUTOINCREMENT,
                    NomClass TEXT NOT NULL,
                    Promotion TEXT NOT NULL,
                    NumEtabli INTEGER,
                    FOREIGN KEY (NumEtabli) REFERENCES etablissements(NumEtabli)
                );`,

        `CREATE TABLE IF NOT EXISTS matieres (
                    CodMat INTEGER PRIMARY KEY AUTOINCREMENT,
                    NomMat TEXT NOT NULL,
                    NumEtabli INTEGER,
                    FOREIGN KEY (NumEtabli) REFERENCES etablissements(NumEtabli)
                );`,

        `CREATE TABLE IF NOT EXISTS coefficientsMatieres (
                    CodMat INTEGER,
                    Coef INTEGER NOT NULL,
                    NumEtabli INTEGER,
                    Annee TEXT,
                    NumClass INTEGER,
                    PRIMARY KEY (CodMat, NumEtabli, Annee, NumClass),
                    FOREIGN KEY (CodMat) REFERENCES matieres(CodMat),
                    FOREIGN KEY (NumClass) REFERENCES classes(NumClass),
                    FOREIGN KEY (NumEtabli) REFERENCES etablissements(NumEtabli),
                    FOREIGN KEY (Annee) REFERENCES annees_scolaires(Annee)
                );`,

        `CREATE TABLE IF NOT EXISTS utilisateurs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    role TEXT NOT NULL
                );`,

        `CREATE TABLE IF NOT EXISTS professeurs (
                    NumProf INTEGER PRIMARY KEY AUTOINCREMENT,
                    NomProf TEXT NOT NULL,
                    PrenomsProf TEXT NOT NULL,
                    Sexe TEXT,
                    Adresse TEXT,
                    Telephone TEXT,
                    Email TEXT,
                    DateNaissance TEXT,
                    LieuNaissance TEXT,
                    Nationalite TEXT,
                    NumEtabli INTEGER,
                    FOREIGN KEY (NumEtabli) REFERENCES etablissements(NumEtabli)
                );`,

        `CREATE TABLE IF NOT EXISTS enseigner (
                    NumProf INTEGER,
                    CodMat INTEGER,
                    NumClass INTEGER,
                    Annee TEXT,
                    NumEtabli INTEGER,
                    PRIMARY KEY (NumProf, CodMat, NumClass, Annee),
                    FOREIGN KEY (NumProf) REFERENCES professeurs(NumProf),
                    FOREIGN KEY (CodMat) REFERENCES matieres(CodMat),
                    FOREIGN KEY (NumClass) REFERENCES classes(NumClass),
                    FOREIGN KEY (NumEtabli) REFERENCES etablissements(NumEtabli),
                    FOREIGN KEY (Annee) REFERENCES annees_scolaires(Annee)
                );`,

        `CREATE TABLE IF NOT EXISTS eleves (
                    Matricule TEXT PRIMARY KEY,
                    Nom TEXT NOT NULL,
                    Prenoms TEXT NOT NULL,
                    Sexe TEXT,
                    DateNaissance TEXT,
                    LieuNaissance TEXT,
                    Nationalite TEXT,
                    ContactParent TEXT,
                    NumEtabli INTEGER,
                    FOREIGN KEY (NumEtabli) REFERENCES etablissements(NumEtabli)
                );`,

        `CREATE TABLE IF NOT EXISTS inscriptions (
                    NumIns INTEGER PRIMARY KEY AUTOINCREMENT,
                    DateIns TEXT NOT NULL,
                    Statut TEXT NOT NULL CHECK(Statut IN ('Nouveau', 'Doublant', 'Redoublant')),
                    Matricule TEXT,
                    NumEtabli INTEGER,
                    NumClass INTEGER,
                    AnneeScolaire TEXT,
                    FOREIGN KEY (Matricule) REFERENCES eleves(Matricule),
                    FOREIGN KEY (NumEtabli) REFERENCES etablissements(NumEtabli),
                    FOREIGN KEY (NumClass) REFERENCES classes(NumClass),
                    FOREIGN KEY (AnneeScolaire) REFERENCES annees_scolaires(Annee)
                );`,

        `CREATE TABLE IF NOT EXISTS periodes (
                    NumPeriode INTEGER PRIMARY KEY AUTOINCREMENT,
                    Libelle TEXT NOT NULL,
                    Periodicite TEXT NOT NULL CHECK(Periodicite IN ('Semestre', 'Trimestre'))
                );`,

        `CREATE TABLE IF NOT EXISTS composer (
                    NumIns INTEGER,
                    CodMat INTEGER,
                    DateCompo TEXT,
                    Note REAL,
                    Type TEXT NOT NULL CHECK(Type IN ('Interrogation', 'Devoir')),
                    NumPeriode INTEGER,
                    PRIMARY KEY (NumIns, CodMat, DateCompo),
                    FOREIGN KEY (NumIns) REFERENCES inscriptions(NumIns),
                    FOREIGN KEY (CodMat) REFERENCES matieres(CodMat),
                    FOREIGN KEY (NumPeriode) REFERENCES periodes(NumPeriode)
                );`,

        `CREATE TABLE IF NOT EXISTS emploi_du_temps (
                    NumEmploi INTEGER PRIMARY KEY AUTOINCREMENT,
                    NumClass INTEGER,
                    NumEtabli INTEGER,
                    Annee TEXT,
                    NumProf INTEGER,
                    FOREIGN KEY (NumClass) REFERENCES classes(NumClass),
                    FOREIGN KEY (NumEtabli) REFERENCES etablissements(NumEtabli),
                    FOREIGN KEY (Annee) REFERENCES annees_scolaires(Annee),
                    FOREIGN KEY (NumProf) REFERENCES professeurs(NumProf)
                );`,

        `CREATE TABLE IF NOT EXISTS cours (
                    NumCours INTEGER PRIMARY KEY AUTOINCREMENT,
                    HDebut TEXT NOT NULL,
                    HFin TEXT NOT NULL,
                    Jour TEXT NOT NULL,
                    CodMat INTEGER,
                    NumEmploi INTEGER,
                    FOREIGN KEY (CodMat) REFERENCES matieres(CodMat),
                    FOREIGN KEY (NumEmploi) REFERENCES emploi_du_temps(NumEmploi)
                );`,
        `
                    INSERT INTO periodes (Libelle, Periodicite)
                    SELECT * FROM (
                        SELECT 'Premier Trimestre' AS Libelle, 'Trimestre' AS Periodicite
                        UNION
                        SELECT 'Deuxieme Trimestre', 'Trimestre'
                        UNION
                        SELECT 'Troisieme Trimestre', 'Trimestre'
                        UNION
                        SELECT 'Premier Semestre', 'Semestre'
                        UNION
                        SELECT 'Deuxieme Semestre', 'Semestre'
                    )
                    WHERE NOT EXISTS (SELECT 1 FROM periodes);
                `,
      ];

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        createTableQueries.forEach((query, index) => {
          db.run(query, (error) => {
            if (error) {
              db.run("ROLLBACK");
              console.error(`Error executing query ${index + 1}:`, error);
              reject(error);
              return;
            }
          });
        });

        db.run("COMMIT", (error) => {
          if (error) {
            console.error("Commit error:", error);
            reject(error);
          } else {
            console.log("Tables initialized successfully");
            resolve();
          }
        });
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
      db.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

export default Database;
