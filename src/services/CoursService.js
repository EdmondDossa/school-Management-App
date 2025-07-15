import Cours from "../models/Cours.js";

class CoursService {
  static async getAllCours() {
    const sql = "SELECT * FROM cours";
    const rows = await window.electronAPI.db.query(sql);
    return rows.map(
      (row) =>
        new Cours(
          row.NumCours,
          row.HDebut,
          row.NBHeures,
          row.Jour,
          row.CodMat,
          row.NumClass,
          row.Annee
        )
    );
  }

  static async getCoursByNumCours(numCours) {
    const sql = "SELECT * FROM cours WHERE NumCours = ?";
    const rows = await window.electronAPI.db.query(sql, [numCours]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new Cours(
      row.NumCours,
      row.HDebut,
      row.NBHeures,
      row.Jour,
      row.CodMat,
      row.NumClass,
      row.Annee
    );
  }

  static async getCoursByClasseAndAnnee(numClass, annee) {
    const sql = `
            SELECT 
                c.*, 
                m.NomMat, 
                m.Couleur,
                cl.Salle,
                p.NomProf, 
                p.PrenomsProf 
            FROM cours c 
            JOIN matieres m ON c.CodMat = m.CodMat 
            JOIN classes cl ON c.NumClass = cl.NumClass
            LEFT JOIN enseigner e ON c.NumClass = e.NumClass AND c.CodMat = e.CodMat AND c.Annee = e.Annee
            LEFT JOIN professeurs p ON e.NumProf = p.NumProf 
            WHERE c.NumClass = ? AND c.Annee = ?
        `;
    const result = await window.electronAPI.db.query(sql, [numClass, annee]);
    if (result.success) {
      return result.data;
    }
    return [];
  }

  static async createCours(cours) {
    const sql =
      "INSERT INTO cours (HDebut, NBHeures, Jour, CodMat, NumClass, Annee) VALUES (?, ?, ?, ?, ?, ?)";
    const result = await window.electronAPI.db.query(sql, [
      cours.HDebut,
      cours.NBHeures,
      cours.Jour,
      cours.Cod_Mat,
      cours.Num_Class,
      cours.Annee,
    ]);
    return result;
  }

  static async updateCours(cours) {
    const sql =
      "UPDATE cours SET HDebut = ?, NBHeures = ?, Jour = ?, CodMat = ?, NumClass = ?, Annee = ? WHERE NumCours = ?";
    const result = await window.electronAPI.db.query(sql, [
      cours.HDebut,
      cours.NBHeures,
      cours.Jour,
      cours.Cod_Mat,
      cours.Num_Class,
      cours.Annee,
      cours.Num_Cours,
    ]);
    return result;
  }

  static async deleteCours(numCours) {
    const sql = "DELETE FROM cours WHERE NumCours = ?";
    const result = await window.electronAPI.db.query(sql, [numCours]);
    return result;
  }
}

export default CoursService;
