import Professeur from "../models/Professeur.js";

class ProfesseurService {
  static async getAllProfesseurs(numEtabli) {
    const sql = "SELECT * FROM professeurs where NumEtab = ?";
    const rows = await window.electronAPI.db.query(sql, [numEtabli]);
    return rows.map(
      (row) =>
        new Professeur(
          row.NumProf,
          row.NomProf,
          row.PrenomProf,
          row.Sexe,
          row.Adresse,
          row.Telephone,
          row.Email,
          row.DateNaissance,
          row.LieuNaissance,
          row.Nationalite
        )
    );
  }

  static async getProfesseurByNum(numProf) {
    const sql = "SELECT * FROM professeurs WHERE NumProf = ?";
    const rows = await window.electronAPI.db.query(sql, [numProf]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new Professeur(
      row.NumProf,
      row.NomProf,
      row.PrenomProf,
      row.Sexe,
      row.Adresse,
      row.Telephone,
      row.Email,
      row.DateNaissance,
      row.LieuNaissance,
      row.Nationalite
    );
  }

  static async createProfesseur(professeur) {
    const sql =
      "INSERT INTO professeurs (NomProf, PrenomProf, Sexe, Adresse, Telephone, Email, DateNaissance, LieuNaissance, Nationalite, NumEtabli) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const result = await window.electronAPI.db.query(sql, [
      this.NumProf,
      this.NomProf,
      this.PrenomProf,
      this.Sexe,
      this.Adresse,
      this.Telephone,
      this.Email,
      this.DateNaissance,
      this.LieuNaissance,
      this.Nationalite,
    ]);
    return result;
  }

  static async updateProfesseur(professeur) {
    const sql =
      "UPDATE professeurs SET NomProf = ?, PrenomProf = ?, Sexe = ?, Adresse = ?, Telephone = ?, Email = ?, DateNaissance = ?, LieuNaissance = ?, Nationalite = ? WHERE NumProf = ?";
    const result = await window.electronAPI.db.query(sql, [
      this.NumProf,
      this.NomProf,
      this.PrenomProf,
      this.Sexe,
      this.Adresse,
      this.Telephone,
      this.Email,
      this.DateNaissance,
      this.LieuNaissance,
      this.Nationalite,
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
