import Classe from "../models/Classe.js";

class ClasseService {
  static async getAllClasses() {
    const sql = "SELECT * FROM classes";
    const result = await window.electronAPI.db.query(sql);
    if (result.success) {
      return result.data.map(
        (row) =>
          new Classe(row.NumClass, row.NomClass, row.Promotion, row.Salle)
      );
    } else {
      return [];
    }
  }

  static async getClasseByNumClass(NumClass) {
    const sql = "SELECT * FROM classes WHERE NumClass = ?";
    const rows = await window.electronAPI.db.query(sql, [NumClass]);
    if (rows.success && rows.data.length === 0) return null;
    else if (rows.success && rows.data.length > 0) {
      const row = rows.data[0];
      return new Classe(row.NumClass, row.NomClass, row.Promotion, row.Salle);
    }
  }

  static async getClassesByAnneeScolaire(AnneeScolaire) {
    const sql = `
      SELECT DISTINCT c.NumClass, c.NomClass, c.Promotion
      FROM classes c
      JOIN inscriptions i ON i.NumClass = c.NumClass
      WHERE i.AnneeScolaire = ?
    `;
    const result = await window.electronAPI.db.query(sql, [AnneeScolaire]);
    if (result.success) {
      return result.data.map(
        (row) =>
          new Classe(row.NumClass, row.NomClass, row.Promotion, row.Salle)
      );
    }
    return [];
  }

  static async createClasse(classe) {
    const sql =
      "INSERT INTO classes (NomClass, Promotion, Salle) VALUES (?, ?, ?)";
    const result = await window.electronAPI.db.query(sql, [
      classe.NomClass,
      classe.Promotion,
      classe.Salle,
    ]);
    return result;
  }

  static async updateClasse(classe) {
    const sql =
      "UPDATE classes SET NomClass = ?, Promotion = ?,  Salle = ? WHERE NumClass = ?";
    const result = await window.electronAPI.db.query(sql, [
      classe.NomClass,
      classe.Promotion,
      classe.Salle,
      classe.NumClass,
    ]);
    return result;
  }

  static async deleteClasse(NumClass) {
    const sql = "DELETE FROM classes WHERE NumClass = ?";
    const result = await window.electronAPI.db.query(sql, [NumClass]);
    return result;
  }
}

export default ClasseService;
