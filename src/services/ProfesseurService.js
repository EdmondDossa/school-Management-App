import Professeur from "../models/Professeur.js";
import profMatieresService from "../services/profMatieresService.js";

class ProfesseurService {
  static async getAllProfesseurs() {
    const sql = "SELECT * FROM professeurs";
    const { data: rows } = await window.electronAPI.db.query(sql);
    let professeurs = [];
    for(const row of rows){
      let matieres = await profMatieresService.getProfMatieres(row.NumProf);
      professeurs.push(
          new Professeur(
            row.NumProf,
            row.NomProf,
            row.PrenomsProf,
            row.Sexe,
            row.Adresse,
            row.Telephone,
            row.Email,
            row.DateNaissance,
            row.LieuNaissance,
            row.Nationalite,
            matieres
      )
    );
  }
  return professeurs;
  }

  static async getProfesseurByNum(numProf) {
    const sql = "SELECT * FROM professeurs WHERE NumProf = ?";
    const { data:rows }= await window.electronAPI.db.query(sql, [numProf]);
    if (rows.length === 0) return null;
    const row = rows[0];
    let matieres = await profMatieresService.getProfMatieres(row.NumProf);
    return new Professeur(
      row.NumProf,
      row.NomProf,
      row.PrenomsProf,
      row.Sexe,
      row.Adresse,
      row.Telephone,
      row.Email,
      row.DateNaissance,
      row.LieuNaissance,
      row.Nationalite,
      matieres
    );
  }

  static async getProfesseurByCodMat(CodMat){
    const sql = `
      SELECT p.NumProf,p.NomProf,p.PrenomsProf 
      FROM professeurs p 
      JOIN profmatieres pm ON pm.NumProf = p.NumProf
      WHERE pm.CodMat = ?
    `
    const { data:rows } = await window.electronAPI.db.query(sql, [CodMat]);
    return rows;
  }

  static async createProfesseur(professeur) {
    const sql =
      "INSERT INTO professeurs (NumProf, NomProf, PrenomsProf, Sexe, Adresse, Telephone, Email, DateNaissance, LieuNaissance, Nationalite) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const result = await window.electronAPI.db.query(sql, [
      professeur.NomProf,
      professeur.PrenomsProf,
      professeur.Sexe,
      professeur.Adresse,
      professeur.Telephone,
      professeur.Email,
      professeur.DateNaissance,
      professeur.LieuNaissance,
      professeur.Nationalite
    ]);
    return result;
  }

  static async updateProfesseur(professeur) {
    const sql =
      "UPDATE professeurs SET NomProf = ?, PrenomsProf = ?, Sexe = ?, Adresse = ?, Telephone = ?, Email = ?, DateNaissance = ?, LieuNaissance = ?, Nationalite = ? WHERE NumProf = ?";
    const result = await window.electronAPI.db.query(sql, [
      professeur.NomProf,
      professeur.PrenomsProf,
      professeur.Sexe,
      professeur.Adresse,
      professeur.Telephone,
      professeur.Email,
      professeur.DateNaissance,
      professeur.LieuNaissance,
      professeur.Nationalite,
      professeur.NumProf,
    ]);
    return result;
  }

  static async deleteProfesseur(numProf) {
    const sql = "DELETE FROM professeurs WHERE NumProf = ?";
    const result = await window.electronAPI.db.query(sql, [numProf]);
    return result;
  }
}

export default ProfesseurService;
