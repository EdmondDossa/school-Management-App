import Eleve from "../models/Eleve.js";

class EleveService {
  static async getAllEleves() {
    const sql = "SELECT * FROM eleves";
    const rows = await window.electronAPI.db.query(sql);
    if (rows.success) {
      return rows.data.map(
        (row) =>
          new Eleve(
            row.Matricule,
            row.Nom,
            row.Prenoms,
            row.Sexe,
            row.DateNaissance,
            row.LieuNaissance,
            row.Nationalite,
            row.ContactParent
          )
      );
    } else {
      toast.error("Erreur lors du chargement des eleves");
      return [];
    }
  }

  static async getTotalEleves() {
    const sql = "SELECT COUNT(Matricule) as total FROM eleves";
    const rows = await window.electronAPI.db.query(sql);
    return rows.data[0].total;
  }

  static async getEleveByMatricule(matricule) {
    const sql = "SELECT * FROM eleves WHERE Matricule = ?";
    const { data: rows } = await window.electronAPI.db.query(sql, [matricule]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new Eleve(
      row.Matricule,
      row.Nom,
      row.Prenoms,
      row.Sexe,
      row.DateNaissance,
      row.LieuNaissance,
      row.Nationalite,
      row.ContactParent
    );
  }

  static async createEleve(eleve) {
    const sql = `
      INSERT INTO eleves
        (Matricule, Nom, Prenoms, Sexe, DateNaissance, LieuNaissance, Nationalite, ContactParent)
      VALUES (?,?,?,?,?,?,?,?) ON CONFLICT (Matricule) DO NOTHING
    `;
    const result = await window.electronAPI.db.query(sql, [
      eleve.Matricule,
      eleve.Nom,
      eleve.Prenoms,
      eleve.Sexe,
      eleve.DateNaissance,
      eleve.LieuNaissance,
      eleve.Nationalite ?? "",
      eleve.ContactParent ?? "",
    ]);
    return result;
  }

  static async insertManyEleves(eleves) {
    const values = eleves
      .map((eleve) => {
        return `('${eleve.Matricule}','${eleve.Nom}','${eleve.Prenoms}','${eleve.Sexe}','${eleve.DateNaissance}','${eleve.LieuNaissance}')`;
      })
      .join(",");

    const sql = `
            INSERT INTO eleves (Matricule, Nom, Prenoms, Sexe, DateNaissance, LieuNaissance)
             VALUES ${values} ON CONFLICT (Matricule) DO NOTHING
        `;

    const result = await window.electronAPI.db.query(sql);
    return result;
  }

  static async updateEleve(eleve) {
    const sql =
      "UPDATE eleves SET Nom = ?, Prenoms = ?, Sexe = ?, DateNaissance = ?, LieuNaissance = ?, Nationalite = ?, ContactParent = ? WHERE Matricule = ?";
    const result = await window.electronAPI.db.query(sql, [
      eleve.Nom,
      eleve.Prenoms,
      eleve.Sexe,
      eleve.DateNaissance,
      eleve.LieuNaissance,
      eleve.Nationalite,
      eleve.ContactParent,
      eleve.Matricule,
    ]);
    return result;
  }

  static async deleteEleve(matricule) {
    const sql = "DELETE FROM eleves WHERE Matricule = ?";
    const result = await window.electronAPI.db.query(sql, [matricule]);
    return result;
  }

  static async searchEleve(searchTherm) {
    let sql = "SELECT * FROM eleves";
    if (searchTherm && searchTherm.trim() !== "") {
      sql =
        "SELECT * FROM eleves WHERE Matricule LIKE ? OR Nom LIKE ? OR Prenoms LIKE ? OR Nationalite LIKE ?";
    }

    const result = await window.electronAPI.db.query(
      sql,
      new Array(4).fill(`%${searchTherm}%`)
    );
    return result;
  }

  static async getLastInserted(length) {
    const sql = "SELECT Matricule FROM eleves ORDER BY created_at DESC LIMIT ?";
    const result = await window.electronAPI.db.query(sql, [length]);
    return result.data.map((res) => res.Matricule);
  }

  static async getPaginatedEleves(page = 1, max = 20) {
    const totalElevesQuery = "SELECT COUNT(*) as total FROM eleves";
    const { data } = await window.electronAPI.db.query(totalElevesQuery);
    const totalEleves = data[0].total;

    const start = (page - 1) * max;
    const sql = `SELECT * FROM  eleves LIMIT ${start},${max}`;
    const { data: rows } = await window.electronAPI.db.query(sql);
    return {
      total: Math.ceil(totalEleves / max),
      currentPage: page,
      eleves: rows,
    };
  }

  static async getEleveByClasse(NumClass) {
    const sql =
      "SELECT * FROM eleves a JOIN inscriptions b ON a.Matricule = b.Matricule WHERE NumClass = ? ";
    const result = await window.electronAPI.db.query(sql, [NumClass]);
    return result.data;
  }
}

export default EleveService;
