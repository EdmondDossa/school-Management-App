import { app } from 'electron';
import { is } from '@electron-toolkit/utils'

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
    : path.join(__dirname, "../../resources/db/school-management.db").replace("app.asar", "app.asar.unpacked");
//const dbPath = path.join(dbDir, "school-management.db");

// Creer la connexion SQLite
const db = new sqlite3.Database(dbPath);

class Database {
    static async initTables() {
        return new Promise((resolve, reject) => {
            const createTableQueries = [
                `CREATE TABLE IF NOT EXISTS annees_scolaires (
                    Annee TEXT PRIMARY KEY,
                    DateDebut TEXT NOT NULL,
                    DateFin TEXT NOT NULL,
                    Periodicite TEXT NOT NULL
                );`,

                `CREATE TABLE IF NOT EXISTS etablissements (
                    Num_Etabli INTEGER PRIMARY KEY AUTOINCREMENT,
                    Nom_Etabli TEXT NOT NULL,
                    Adresse TEXT,
                    Telephone TEXT,
                    Email TEXT
                );`,

                `CREATE TABLE IF NOT EXISTS classes (
                    Num_Class INTEGER PRIMARY KEY AUTOINCREMENT,
                    Nom_Class TEXT NOT NULL,
                    Promotion TEXT NOT NULL,
                    Num_Etabli INTEGER,
                    FOREIGN KEY (Num_Etabli) REFERENCES etablissements(Num_Etabli)
                );`,

                `CREATE TABLE IF NOT EXISTS matieres (
                    Cod_Mat TEXT PRIMARY KEY,
                    Nom_Mat TEXT NOT NULL
                );`,

                `CREATE TABLE IF NOT EXISTS coefficientsMatieres (
                    Cod_Mat TEXT,
                    Coef INTEGER NOT NULL,
                    Num_Etabli INTEGER,
                    Annee TEXT,
                    Num_Class INTEGER,
                    PRIMARY KEY (Cod_Mat, Num_Etabli, Annee, Num_Class),
                    FOREIGN KEY (Cod_Mat) REFERENCES matieres(Cod_Mat),
                    FOREIGN KEY (Num_Class) REFERENCES classes(Num_Class),
                    FOREIGN KEY (Num_Etabli) REFERENCES etablissements(Num_Etabli),
                    FOREIGN KEY (Annee) REFERENCES annees_scolaires(Annee)
                );`,

                `CREATE TABLE IF NOT EXISTS utilisateurs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    role TEXT NOT NULL
                );`,

                `CREATE TABLE IF NOT EXISTS professeurs (
                    Num_Prof INTEGER PRIMARY KEY AUTOINCREMENT,
                    Nom_Prof TEXT NOT NULL,
                    Prenom_Prof TEXT NOT NULL,
                    Sexe TEXT,
                    Adresse TEXT,
                    Telephone TEXT,
                    Email TEXT,
                    Date_Naissance TEXT,
                    Lieu_Naissance TEXT,
                    Nationalite TEXT
                );`,

                `CREATE TABLE IF NOT EXISTS enseigner (
                    Num_Prof INTEGER,
                    Cod_Mat TEXT,
                    Num_Class INTEGER,
                    Num_Etabli INTEGER,
                    Annee TEXT,
                    PRIMARY KEY (Num_Prof, Cod_Mat, Num_Class, Num_Etabli, Annee),
                    FOREIGN KEY (Num_Prof) REFERENCES professeurs(Num_Prof),
                    FOREIGN KEY (Cod_Mat) REFERENCES matieres(Cod_Mat),
                    FOREIGN KEY (Num_Class) REFERENCES classes(Num_Class),
                    FOREIGN KEY (Num_Etabli) REFERENCES etablissements(Num_Etabli),
                    FOREIGN KEY (Annee) REFERENCES annees_scolaires(Annee)
                );`,

                `CREATE TABLE IF NOT EXISTS eleves (
                    Matricule TEXT PRIMARY KEY,
                    Nom_Eleve TEXT NOT NULL,
                    Prenom_Eleve TEXT NOT NULL,
                    Sexe TEXT,
                    Date_Naissance TEXT,
                    Lieu_Naissance TEXT,
                    Nationalite TEXT,
                    ContactParent TEXT,
                    Num_Etabli INTEGER,
                    FOREIGN KEY (Num_Etabli) REFERENCES etablissements(Num_Etabli)
                );`,

                `CREATE TABLE IF NOT EXISTS inscriptions (
                    Num_Ins INTEGER PRIMARY KEY AUTOINCREMENT,
                    Date_Ins TEXT NOT NULL,
                    Statut TEXT NOT NULL CHECK(Statut IN ('Nouveau', 'Doublant', 'Redoublant')),
                    Matricule TEXT,
                    Num_Etabli INTEGER,
                    Num_Class INTEGER,
                    Annee_Scolaire TEXT,
                    FOREIGN KEY (Matricule) REFERENCES eleves(Matricule),
                    FOREIGN KEY (Num_Etabli) REFERENCES etablissements(Num_Etabli),
                    FOREIGN KEY (Num_Class) REFERENCES classes(Num_Class),
                    FOREIGN KEY (Annee_Scolaire) REFERENCES annees_scolaires(Annee)
                );`,

                `CREATE TABLE IF NOT EXISTS periodes (
                    numPeriode INTEGER PRIMARY KEY AUTOINCREMENT,
                    Libelle TEXT NOT NULL,
                    Periodicite TEXT NOT NULL CHECK(Periodicite IN ('Semestre', 'Trimestre'))
                );`,

                `CREATE TABLE IF NOT EXISTS composer (
                    Num_Ins INTEGER,
                    Cod_Mat TEXT,
                    Date_Compo TEXT,
                    Note REAL,
                    Type TEXT NOT NULL CHECK(Type IN ('Interrogation', 'Devoir')),
                    numPeriode INTEGER,
                    PRIMARY KEY (Num_Ins, Cod_Mat, Date_Compo),
                    FOREIGN KEY (Num_Ins) REFERENCES inscriptions(Num_Ins),
                    FOREIGN KEY (Cod_Mat) REFERENCES matieres(Cod_Mat),
                    FOREIGN KEY (numPeriode) REFERENCES periodes(numPeriode)
                );`,

                `CREATE TABLE IF NOT EXISTS emploi_du_temps (
                    Num_Emploi INTEGER PRIMARY KEY AUTOINCREMENT,
                    Num_Class INTEGER,
                    Num_Etabli INTEGER,
                    Annee TEXT,
                    Num_Prof INTEGER,
                    FOREIGN KEY (Num_Class) REFERENCES classes(Num_Class),
                    FOREIGN KEY (Num_Etabli) REFERENCES etablissements(Num_Etabli),
                    FOREIGN KEY (Annee) REFERENCES annees_scolaires(Annee),
                    FOREIGN KEY (Num_Prof) REFERENCES professeurs(Num_Prof)
                );`,

                `CREATE TABLE IF NOT EXISTS cours (
                    Num_Cours INTEGER PRIMARY KEY AUTOINCREMENT,
                    HDebut TEXT NOT NULL,
                    HFin TEXT NOT NULL,
                    Jour TEXT NOT NULL,
                    Cod_Mat TEXT,
                    Num_Emploi INTEGER,
                    FOREIGN KEY (Cod_Mat) REFERENCES matieres(Cod_Mat),
                    FOREIGN KEY (Num_Emploi) REFERENCES emploi_du_temps(Num_Emploi)
                );`


            ]

            db.serialize(() => {
                createTableQueries.forEach(query => db.run(query));
                console.log("Tables initialisees avec succès");
                resolve();
            });
        }
        );
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
