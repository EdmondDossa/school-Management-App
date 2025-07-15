import Matiere from "../models/Matiere.js";

class MatiereService {
  static async getAllMatieres() {
    const sql = "SELECT * FROM matieres";
    const result = await window.electronAPI.db.query(sql);
    if (result.success) {
      return result.data.map(
        (row) => new Matiere(row.CodMat, row.NomMat, row.Couleur)
      );
    }
    return [];
  }

  static async getMatiereByCode(CodMat) {
    const sql = "SELECT * FROM matieres WHERE CodMat = ?";
    const result = await window.electronAPI.db.query(sql, [CodMat]);
    if (result.success && result.data.length > 0) {
      const row = result.data[0];
      return new Matiere(row.CodMat, row.NomMat, row.Couleur);
    }
    return null;
  }

  static async createMatiere(matiere) {
    const sql = "INSERT INTO matieres (NomMat, Couleur) VALUES (?, ?)";
    const result = await window.electronAPI.db.query(sql, [
      matiere.NomMat,
      matiere.Couleur,
    ]);
    return result;
  }

  static async updateMatiere(matiere) {
    const sql = "UPDATE matieres SET NomMat = ?, Couleur = ? WHERE CodMat = ?";
    const result = await window.electronAPI.db.query(sql, [
      matiere.NomMat,
      matiere.Couleur,
      matiere.CodMat,
    ]);
    return result;
  }

  static async deleteMatiere(CodMat) {
    const sql = "DELETE FROM matieres WHERE CodMat = ?";
    const result = await window.electronAPI.db.query(sql, [CodMat]);
    return result;
  }
}

export default MatiereService;
