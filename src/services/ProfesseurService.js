import Professeur from "../models/Professeur.js";

class ProfesseurService {
  static async getAllProfesseurs(numEtabli) {
    const sql = "SELECT * FROM professeurs where NumEtabli = ?";
    const { data: rows } = await window.electronAPI.db.query(sql, [numEtabli]);
    return rows.map(
      (row) =>
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
          row.CodMat
        )
    );
  }

  static async getProfesseurByNum(numProf) {
    const sql = "SELECT * FROM professeurs WHERE NumProf = ?";
    const { data:rows }= await window.electronAPI.db.query(sql, [numProf]);
    if (rows.length === 0) return null;
    const row = rows[0];
    
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
      row.CodMat
    );
  }

  static async createProfesseur(professeur) {
    console.log(professeur.CodMat);
    
    const sql =
      "INSERT INTO professeurs (NumProf, NomProf, PrenomsProf, Sexe, Adresse, Telephone, Email, DateNaissance, LieuNaissance, Nationalite, NumEtabli,CodMat) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)";
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
      professeur.NumEtabli,
      professeur.CodMat,
    ]);
    return result;
  }

  static async updateProfesseur(professeur) {
    const sql =
      "UPDATE professeurs SET NomProf = ?, PrenomsProf = ?, Sexe = ?, Adresse = ?, Telephone = ?, Email = ?, DateNaissance = ?, LieuNaissance = ?, Nationalite = ?, CodMat = ? WHERE NumProf = ?";
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
      professeur.CodMat,
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
