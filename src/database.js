import knex from "knex";
import path from "node:path";
import fs from "node:fs";
import { app } from "electron";

function getDbPath() {
  if (app?.isPackaged) {
    const dir = path.join(app.getPath("userData"), "db");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, "school-manager.db");
  }
  // dev
  const dir = path.join(process.cwd(), "resources", "db");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "school-manager.db");
}

export const db = knex({
  client: "sqlite3",
  connection: { filename: getDbPath() },
  useNullAsDefault: true,
});

export async function initializeDatabase() {
  try {
    const migrationsDir = app?.isPackaged
      ? path.join(process.resourcesPath, "migrations") // grâce à extraResource
      : path.join(process.cwd(), "migrations");

    await db.migrate.latest({ directory: migrationsDir });
    console.log("Migrations applied successfully.");
    // Seed minimal (exemple – idem que ton fichier actuel)
    const { count } = (await db("matieres")
      .count("CodMat as count")
      .first()) || { count: 0 };
    if (Number(count) === 0) {
      await db("matieres").insert([
        { NomMat: "Français", Couleur: "#FFC0CB" },
        { NomMat: "Mathématiques", Couleur: "#ADD8E6" },
        { NomMat: "Histoire-Géographie", Couleur: "#90EE90" },
        { NomMat: "Physique Chimie et Technologies (PCT)", Couleur: "#FFD700" },
        {
          NomMat: "Sciences de la Vie et de la Terre (SVT)",
          Couleur: "#FFA07A",
        },
        { NomMat: "Anglais", Couleur: "#B0E0E6" },
        { NomMat: "Espagnol", Couleur: "#FFB6C1" },
        { NomMat: "Allemand", Couleur: "#F0E68C" },
        { NomMat: "Éducation Physique et Sportive (EPS)", Couleur: "#D3D3D3" },
        { NomMat: "Conduite", Couleur: "#E6E6FA" },
      ]);
    }
  } catch (error) {
    console.error("Error running migrations or seeding data:", error);
  }
}
