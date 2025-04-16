import Periode from "../models/Periode.js";

class PeriodeService {
  static async getAllPeriodes() {
    const sql = "SELECT * FROM periodes";
    const result = await window.electronAPI.db.query(sql);
    return (
      result?.data.map(
        (row) => new Periode(row.NumPeriode, row.Libelle, row.Periodicite)
      ) ?? []
    );
  }

  static async getPeriodeByNum(NumPeriode) {
    const sql = "SELECT * FROM periodes WHERE NumPeriode = ?";
    const result = await window.electronAPI.db.query(sql, [NumPeriode]);
    if (result.data.length === 0) return null;
    const row = result.data[0];
    return new Periode(row.NumPeriode, row.Libelle, row.Periodicite);
  }

  static async createPeriode(periode) {
    const sql = "INSERT INTO periodes (Libelle, Periodicite) VALUES (?, ?)";
    const result = await window.electronAPI.db.query(sql, [
      periode.Libelle,
      periode.Periodicite,
    ]);
    return result;
  }

  static async updatePeriode(periode) {
    const sql =
      "UPDATE periodes SET Libelle = ?, Periodicite = ? WHERE NumPeriode = ?";
    const result = await window.electronAPI.db.query(sql, [
      periode.Libelle,
      periode.Periodicite,
      periode.NumPeriode,
    ]);
    return result;
  }

  static async deletePeriode(NumPeriode) {
    const sql = "DELETE FROM periodes WHERE NumPeriode = ?";
    const result = await window.electronAPI.db.query(sql, [NumPeriode]);
    return result;
  }
}

export default PeriodeService;
