import EmploiDuTemps from '../models/EmploiDuTemps.js';

class EmploiDuTempsService {
    static async getAllEmploisDuTemps() {
        const sql = "SELECT * FROM emploi_du_temps";
        const rows = await window.electronAPI.db.query(sql);
        return rows.map(row => new EmploiDuTemps(row.Num_Emploi, row.Num_Class, row.Annee, row.Num_Prof));
    }

    static async getEmploiDuTempsByNumEmploi(numEmploi) {
        const sql = "SELECT * FROM emploi_du_temps WHERE Num_Emploi = ?";
        const rows = await window.electronAPI.db.query(sql, [numEmploi]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return new EmploiDuTemps(row.Num_Emploi, row.Num_Class, row.Annee, row.Num_Prof);
    }

    static async createEmploiDuTemps(emploiDuTemps) {
        const sql = "INSERT INTO emploi_du_temps (Num_Emploi, Num_Class, Annee, Num_Prof) VALUES (?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [emploiDuTemps.numEmploi, emploiDuTemps.numClass, emploiDuTemps.annee, emploiDuTemps.numProf]);
        return result;
    }

    static async updateEmploiDuTemps(emploiDuTemps) {
        const sql = "UPDATE emploi_du_temps SET Num_Class = ?, Annee = ?, Num_Prof = ? WHERE Num_Emploi = ?";
        const result = await window.electronAPI.db.query(sql, [emploiDuTemps.numClass, emploiDuTemps.annee, emploiDuTemps.numProf, emploiDuTemps.numEmploi]);
        return result;
    }

    static async deleteEmploiDuTemps(numEmploi) {
        const sql = "DELETE FROM emploi_du_temps WHERE Num_Emploi = ?";
        const result = await window.electronAPI.db.query(sql, [numEmploi]);
        return result;
    }
}

export default EmploiDuTempsService;
