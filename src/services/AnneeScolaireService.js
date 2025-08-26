import AnneeScolaire from "../models/AnneeScolaire.js";

class AnneeScolaireService {
  static async getAllAnneesScolaires() {
    const sql = "SELECT * FROM annees_scolaires";
    const result = await window.electronAPI.db.query(sql);

    if (result.success) {
      const data = result.data.map(
        (an) =>
          new AnneeScolaire(
            an.Annee,
            an.DateDebut,
            an.DateFin,
            an.Periodicite,
            an.id
          )
      );

      return { success: true, data };
    }
    return [];
  }

  static async getAllOldAnneeScolaire() {
    const sql =
      "SELECT * FROM annees_scolaires WHERE Statut = 'Termine' ORDER BY id DESC";
    const result = await window.electronAPI.db.query(sql);
    return result.data?.length ? result.data : [];
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
        row.Periodicite
      );
    }
  }

  static async createAnneeScolaire(anneeScolaire) {
    const sql =
      "INSERT INTO annees_scolaires (Annee, DateDebut, DateFin, Periodicite) VALUES (?, ?, ?, ?)";
    const result = await window.electronAPI.db.query(sql, [
      anneeScolaire.Annee,
      anneeScolaire.DateDebut,
      anneeScolaire.DateFin,
      anneeScolaire.Periodicite,
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

  static async getLastAnneeScolaire() {
    const sql = "SELECT * FROM annees_scolaires ORDER BY id DESC LIMIT 1";
    const result = await window.electronAPI.db.query(sql);
    return result.data[0] ?? {};
  }

  static async setAnneeScolaireAsTerminee(id) {
    const sql = "UPDATE annees_scolaires SET Statut = 'Termine' WHERE id = ?";
    const result = await window.electronAPI.db.query(sql, [id]);
    return result;
  }
}

export default AnneeScolaireService;
