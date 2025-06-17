import Inscription from '../models/Inscription.js';

class InscriptionService {
    static async getAllInscriptions() {
        const sql = "SELECT * FROM inscriptions";
        const rows = await window.electronAPI.db.query(sql);
        return rows.map(row => new Inscription(row.Num_Ins, row.Date_Ins, row.Statut, row.Matricule, row.Num_Etabli, row.Num_Class, row.Annee_Scolaire));
    }

    static async getInscriptionByNum(numIns) {
        const sql = "SELECT * FROM inscriptions WHERE Num_Ins = ?";
        const rows = await window.electronAPI.db.query(sql, [numIns]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return new Inscription(row.Num_Ins, row.Date_Ins, row.Statut, row.Matricule, row.Num_Etabli, row.Num_Class, row.Annee_Scolaire);
    }

    static async getInscriptionByMatricule(matricule) {
        const sql = "SELECT * FROM inscriptions WHERE Matricule = ?";
        const rows = await window.electronAPI.db.query(sql, [matricule]);
        return rows.map(row => new Inscription(row.Num_Ins, row.Date_Ins, row.Statut, row.Matricule, row.Num_Etabli, row.Num_Class, row.Annee_Scolaire));
    }

    static async getInscriptionByEtablissement(numEtabli) {
        const sql = "SELECT * FROM inscriptions WHERE Num_Etabli = ?";
        const rows = await window.electronAPI.db.query(sql, [numEtabli]);
        return rows.map(row => new Inscription(row.Num_Ins, row.Date_Ins, row.Statut, row.Matricule, row.Num_Etabli, row.Num_Class, row.Annee_Scolaire));
    }

    static async getInscriptionByClasse(numClass) {
        const sql = "SELECT * FROM inscriptions WHERE Num_Class = ?";
        const rows = await window.electronAPI.db.query(sql, [numClass]);
        return rows.map(row => new Inscription(row.Num_Ins, row.Date_Ins, row.Statut, row.Matricule, row.Num_Etabli, row.Num_Class, row.Annee_Scolaire));
    }

    static async getInscriptionByAnneeScolaire(anneeScolaire) {
        const sql = "SELECT * FROM inscriptions WHERE AnneeScolaire = ?";
        const { data:rows } = await window.electronAPI.db.query(sql, [anneeScolaire]);
        return rows.map(row => new Inscription(row.Num_Ins, row.Date_Ins, row.Statut, row.Matricule, row.Num_Etabli, row.Num_Class, row.Annee_Scolaire));
    }

    static async createInscription(inscription) {
        const sql = "INSERT INTO inscriptions (Date_Ins, Statut, Matricule, Num_Etabli, Num_Class, Annee_Scolaire) VALUES (?, ?, ?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [inscription.dateIns, inscription.statut, inscription.matricule, inscription.numEtabli, inscription.numClass, inscription.anneeScolaire]);
        return result;
    }

    static async updateInscription(inscription) {
        const sql = "UPDATE inscriptions SET Date_Ins = ?, Statut = ?, Matricule = ?, Num_Etabli = ?, Num_Class = ?, Annee_Scolaire = ? WHERE Num_Ins = ?";
        const result = await window.electronAPI.db.query(sql, [inscription.dateIns, inscription.statut, inscription.matricule, inscription.numEtabli, inscription.numClass, inscription.anneeScolaire, inscription.numIns]);
        return result;
    }

    static async deleteInscription(numIns) {
        const sql = "DELETE FROM inscriptions WHERE Num_Ins = ?";
        const result = await window.electronAPI.db.query(sql, [numIns]);
        return result;
    }
}

export default InscriptionService;