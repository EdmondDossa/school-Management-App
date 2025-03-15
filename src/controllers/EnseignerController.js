import Enseigner from '../models/Enseigner.js';

class EnseignerController {
    static async getAllEnseignements() {
        const sql = "SELECT * FROM enseigner";
        const rows = await window.electronAPI.db.query(sql);
        return rows.map(row => new Enseigner(row.Num_Prof, row.Cod_Mat, row.Num_Class, row.Num_Etabli, row.Annee));
    }

    static async getEnseignementByProfesseur(numProf) {
        const sql = "SELECT * FROM enseigner WHERE Num_Prof = ?";
        const rows = await window.electronAPI.db.query(sql, [numProf]);
        return rows.map(row => new Enseigner(row.Num_Prof, row.Cod_Mat, row.Num_Class, row.Num_Etabli, row.Annee));
    }

    static async getEnseignementByMatiere(codMat) {
        const sql = "SELECT * FROM enseigner WHERE Cod_Mat = ?";
        const rows = await window.electronAPI.db.query(sql, [codMat]);
        return rows.map(row => new Enseigner(row.Num_Prof, row.Cod_Mat, row.Num_Class, row.Num_Etabli, row.Annee));
    }

    static async getEnseignementByClasse(numClass) {
        const sql = "SELECT * FROM enseigner WHERE Num_Class = ?";
        const rows = await window.electronAPI.db.query(sql, [numClass]);
        return rows.map(row => new Enseigner(row.Num_Prof, row.Cod_Mat, row.Num_Class, row.Num_Etabli, row.Annee));
    }

    static async getEnseignementByEtablissement(numEtabli) {
        const sql = "SELECT * FROM enseigner WHERE Num_Etabli = ?";
        const rows = await window.electronAPI.db.query(sql, [numEtabli]);
        return rows.map(row => new Enseigner(row.Num_Prof, row.Cod_Mat, row.Num_Class, row.Num_Etabli, row.Annee));
    }

    static async getEnseignementByAnnee(annee) {
        const sql = "SELECT * FROM enseigner WHERE Annee = ?";
        const rows = await window.electronAPI.db.query(sql, [annee]);
        return rows.map(row => new Enseigner(row.Num_Prof, row.Cod_Mat, row.Num_Class, row.Num_Etabli, row.Annee));
    }

    static async createEnseignement(enseignement) {
        const sql = "INSERT INTO enseigner (Num_Prof, Cod_Mat, Num_Class, Num_Etabli, Annee) VALUES (?, ?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [enseignement.numProf, enseignement.codMat, enseignement.numClass, enseignement.numEtabli, enseignement.annee]);
        return result;
    }

    static async deleteEnseignement(enseignement) {
        const sql = "DELETE FROM enseigner WHERE Num_Prof = ? AND Cod_Mat = ? AND Num_Class = ? AND Num_Etabli = ? AND Annee = ?";
        const result = await window.electronAPI.db.query(sql, [enseignement.numProf, enseignement.codMat, enseignement.numClass, enseignement.numEtabli, enseignement.annee]);
        return result;
    }
}

export default EnseignerController;
