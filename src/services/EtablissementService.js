import Etablissement from '../models/Etablissement.js';

class EtablissementService {
    static async getAllEtablissements() {
        const sql = "SELECT * FROM etablissements";
        const result = await window.electronAPI.db.query(sql);
        if (result.data.length > 0) {
            const rows = result.data.map(row => {
                return {
                    NumEtabli: row.NumEtabli,
                    NomEtabli: row.NomEtabli,
                    Adresse: row.Adresse,
                    Telephone: row.Telephone,
                    Logo: row.Logo,
                    Email: row.Email
                };
            });
            result.data = rows;
        }
        return result.data ?? [];
    }

    static async getEtablissementByNum(numEtabli) {
        const sql = "SELECT * FROM etablissements WHERE NumEtabli = ?";
        const rows = await window.electronAPI.db.query(sql, [numEtabli]);
        if (rows.data.length === 0) return null;
        const row = rows.data[0];
        return new Etablissement(row.NumEtabli, row.NomEtabli, row.Adresse, row.Telephone, row.Email);
    }

    static async createEtablissement(etablissement) {
        const sql = "INSERT INTO etablissements (NomEtabli, Adresse, Telephone, Logo, Email) VALUES (?, ?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [etablissement.NomEtabli, etablissement.Adresse, etablissement.Telephone, etablissement.Logo, etablissement.Email]);
        return result;
    }

    static async updateEtablissement(etablissement) {
        const sql = "UPDATE etablissements SET NomEtabli = ?, Adresse = ?, Telephone = ?, Logo = ?, Email = ? WHERE NumEtabli = ?";
        const result = await window.electronAPI.db.query(sql, [etablissement.NomEtabli, etablissement.Adresse, etablissement.Telephone, etablissement.Logo, etablissement.Email, etablissement.NumEtabli]);
        return result;
    }

    static async deleteEtablissement(numEtabli) {
        const sql = "DELETE FROM etablissements WHERE NumEtabli = ?";
        const result = await window.electronAPI.db.query(sql, [numEtabli]);
        return result;
    }
}

export default EtablissementService;

