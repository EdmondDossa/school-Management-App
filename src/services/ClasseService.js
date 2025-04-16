import Classe from "../models/Classe.js";

class ClasseService {
  static async getAllClasses(NumEtabli) {
    const sql = "SELECT * FROM classes WHERE NumEtabli = ?";
    const result = await window.electronAPI.db.query(sql, [NumEtabli]);
    if (result.success) {
      return result.data.map(
        (row) =>
          new Classe(row.NumClass, row.NomClass, row.Promotion, row.NumEtabli)
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
        row.Promotion,
        row.NumEtabli
      );
    }
  }

  static async createClasse(classe) {
    const sql =
      "INSERT INTO classes (NomClass, Promotion, NumEtabli) VALUES (?, ?, ?)";
    const result = await window.electronAPI.db.query(sql, [
      classe.NomClass,
      classe.Promotion,
      classe.NumEtabli,
    ]);
    return result;
  }

  static async updateClasse(classe) {
    const sql =
      "UPDATE classes SET NomClass = ?, Promotion = ?, NumEtabli = ? WHERE NumClass = ?";
    const result = await window.electronAPI.db.query(sql, [
      classe.NomClass,
      classe.Promotion,
      classe.NumEtabli,
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
