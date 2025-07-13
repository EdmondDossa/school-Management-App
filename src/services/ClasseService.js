import Classe from "../models/Classe.js";

class ClasseService {
  static async getAllClasses() {
    const sql = "SELECT * FROM classes";
    const result = await window.electronAPI.db.query(sql);
    if (result.success) {
      return result.data.map(
        (row) =>
          new Classe(row.NumClass, row.NomClass, row.Promotion)
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
      return new Classe(
        row.NumClass,
        row.NomClass,
        row.Promotion
      );
    }
  }

  static async createClasse(classe) {
    const sql =
      "INSERT INTO classes (NomClass, Promotion) VALUES (?, ?)";
    const result = await window.electronAPI.db.query(sql, [
      classe.NomClass,
      classe.Promotion
    ]);
    return result;
  }

  static async updateClasse(classe) {
    const sql =
      "UPDATE classes SET NomClass = ?, Promotion = ? WHERE NumClass = ?";
    const result = await window.electronAPI.db.query(sql, [
      classe.NomClass,
      classe.Promotion,
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
