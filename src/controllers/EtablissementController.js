import Etablissement from '../models/Etablissement.js';

class EtablissementController {
    static async getAllEtablissements() {
        const sql = "SELECT * FROM etablissements";
        const rows = await window.electronAPI.db.query(sql);
        return rows.map(row => new Etablissement(row.Num_Etabli, row.Nom_Etabli, row.Adresse, row.Telephone, row.Email));
    }

    static async getEtablissementByNum(numEtabli) {
        const sql = "SELECT * FROM etablissements WHERE Num_Etabli = ?";
        const rows = await window.electronAPI.db.query(sql, [numEtabli]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return new Etablissement(row.Num_Etabli, row.Nom_Etabli, row.Adresse, row.Telephone, row.Email);
    }

    static async createEtablissement(etablissement) {
        const sql = "INSERT INTO etablissements (Nom_Etabli, Adresse, Telephone, Email) VALUES (?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [etablissement.nomEtabli, etablissement.adresse, etablissement.telephone, etablissement.email]);
        return result;
    }

    static async updateEtablissement(etablissement) {
        const sql = "UPDATE etablissements SET Nom_Etabli = ?, Adresse = ?, Telephone = ?, Email = ? WHERE Num_Etabli = ?";
        const result = await window.electronAPI.db.query(sql, [etablissement.nomEtabli, etablissement.adresse, etablissement.telephone, etablissement.email, etablissement.numEtabli]);
        return result;
    }

    static async deleteEtablissement(numEtabli) {
        const sql = "DELETE FROM etablissements WHERE Num_Etabli = ?";
        const result = await window.electronAPI.db.query(sql, [numEtabli]);
        return result;
    }
}

export default EtablissementController;

