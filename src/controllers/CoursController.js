import Cours from '../models/Cours.js';

class CoursController {
    static async getAllCours() {
        const sql = "SELECT * FROM emploi_du_temps";
        const rows = await window.electronAPI.db.query(sql);
        return rows.map(row => new Cours(row.Num_Emploi, row.Num_Class, row.Num_Etabli, row.Annee, row.Num_Prof));
    }

    static async getCoursByNumEmploi(numEmploi) {
        const sql = "SELECT * FROM emploi_du_temps WHERE Num_Emploi = ?";
        const rows = await window.electronAPI.db.query(sql, [numEmploi]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return new Cours(row.Num_Emploi, row.Num_Class, row.Num_Etabli, row.Annee, row.Num_Prof);
    }

    static async createCours(cours) {
        const sql = "INSERT INTO emploi_du_temps (Num_Emploi, Num_Class, Num_Etabli, Annee, Num_Prof) VALUES (?, ?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [cours.numEmploi, cours.numClass, cours.numEtabli, cours.annee, cours.numProf]);
        return result;
    }

    static async updateCours(cours) {
        const sql = "UPDATE emploi_du_temps SET Num_Class = ?, Num_Etabli = ?, Annee = ?, Num_Prof = ? WHERE Num_Emploi = ?";
        const result = await window.electronAPI.db.query(sql, [cours.numClass, cours.numEtabli, cours.annee, cours.numProf, cours.numEmploi]);
        return result;
    }

    static async deleteCours(numEmploi) {
        const sql = "DELETE FROM emploi_du_temps WHERE Num_Emploi = ?";
        const result = await window.electronAPI.db.query(sql, [numEmploi]);
        return result;
    }
}

export default CoursController;