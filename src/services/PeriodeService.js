import Periode from '../models/Periode.js';

class PeriodeService {
    static async getAllPeriodes() {
        const sql = "SELECT * FROM periodes";
        const rows = await window.electronAPI.db.query(sql);
        return rows.map(row => new Periode(row.numPeriode, row.Libelle, row.Periodicite));
    }

    static async getPeriodeByNum(numPeriode) {
        const sql = "SELECT * FROM periodes WHERE numPeriode = ?";
        const rows = await window.electronAPI.db.query(sql, [numPeriode]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return new Periode(row.numPeriode, row.Libelle, row.Periodicite);
    }

    static async createPeriode(periode) {
        const sql = "INSERT INTO periodes (Libelle, Periodicite) VALUES (?, ?)";
        const result = await window.electronAPI.db.query(sql, [periode.libelle, periode.periodicite]);
        return result;
    }

    static async updatePeriode(periode) {
        const sql = "UPDATE periodes SET Libelle = ?, Periodicite = ? WHERE numPeriode = ?";
        const result = await window.electronAPI.db.query(sql, [periode.libelle, periode.periodicite, periode.numPeriode]);
        return result;
    }

    static async deletePeriode(numPeriode) {
        const sql = "DELETE FROM periodes WHERE numPeriode = ?";
        const result = await window.electronAPI.db.query(sql, [numPeriode]);
        return result;
    }
}

export default PeriodeService;
