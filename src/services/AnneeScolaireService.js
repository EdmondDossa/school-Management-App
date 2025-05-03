import AnneeScolaire from "../models/AnneeScolaire.js";

class AnneeScolaireService {
  static async getAllAnneesScolaires(Num_Etabli) {
    const sql = "SELECT * FROM annees_scolaires WHERE NumEtabli = ?";
    const result = await window.electronAPI.db.query(sql, [Num_Etabli]);
    if (result.success) {
      return result.data.map(
        (an) =>
          new AnneeScolaire(
            an.id,
            an.Annee,
            an.DateDebut,
            an.DateFin,
            an.Periodicite,
            an.NumEtabli
          )
      );
    }
    return [];
  }

  static async getAnneeScolaireById(id) {
    const sql = "SELECT * FROM annees_scolaires WHERE id = ?";
    const result = await window.electronAPI.db.query(sql, [id]);
    if (result.success) {
      if (result.data.length === 0) return null;
      const row = result.data[0];
      return new AnneeScolaire(
        id,
        row.Annee,
        row.DateDebut,
        row.DateFin,
        row.Periodicite,
        row.NumEtabli
      );
    }
  }

  static async createAnneeScolaire(anneeScolaire) {
    const sql =
      "INSERT INTO annees_scolaires (Annee, DateDebut, DateFin, Periodicite, NumEtabli) VALUES (?, ?, ?, ?, ?)";
    const result = await window.electronAPI.db.query(sql, [
      anneeScolaire.Annee,
      anneeScolaire.DateDebut,
      anneeScolaire.DateFin,
      anneeScolaire.Periodicite,
      anneeScolaire.NumEtabli,
    ]);
    return result;
  }

  static async updateAnneeScolaire(anneeScolaire) {
    const sql =
      "UPDATE annees_scolaires SET Annee = ?, DateDebut = ?, DateFin = ?, Periodicite = ? WHERE id = ?";
    const result = await window.electronAPI.db.query(sql, [
      anneeScolaire.Annee,
      anneeScolaire.DateDebut,
      anneeScolaire.DateFin,
      anneeScolaire.Periodicite,
      anneeScolaire.id,
    ]);
    return result;
  }

  static async deleteAnneeScolaire(anneeScolaire) {
    const sql = "DELETE FROM annees_scolaires WHERE id = ?";
    const result = await window.electronAPI.db.query(sql, [anneeScolaire.id]);
    return result;
  }
}

export default AnneeScolaireService;
