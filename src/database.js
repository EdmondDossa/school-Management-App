const knex = require("knex");
const knexConfig = require("../../knexfile");

const db = knex(knexConfig.development);

async function initializeDatabase() {
  try {
    await db.migrate.latest();
    console.log("Migrations ran successfully.");

    const matieresCount = await db("matieres").count("CodMat as count").first();
    if (matieresCount.count === 0) {
      await db("matieres").insert([
        { NomMat: "Français", Couleur: "#FFC0CB" },
        { NomMat: "Mathématiques", Couleur: "#ADD8E6" },
        { NomMat: "Histoire-Géographie", Couleur: "#90EE90" },
        { NomMat: "Physique Chimie et Technologies (PCT)", Couleur: "#FFD700" },
        { NomMat: "Sciences de la Vie et de la Terre (SVT)", Couleur: "#FFA07A" },
        { NomMat: "Anglais", Couleur: "#B0E0E6" },
        { NomMat: "Espagnol", Couleur: "#FFB6C1" },
        { NomMat: "Allemand", Couleur: "#F0E68C" },
        { NomMat: "Éducation Physique et Sportive (EPS)", Couleur: "#D3D3D3" },
        { NomMat: "Conduite", Couleur: "#E6E6FA" },
      ]);
      console.log("Default subjects inserted.");
    }
  } catch (error) {
    console.error("Error running migrations or seeding data:", error);
  }
}

export { db, initializeDatabase };
