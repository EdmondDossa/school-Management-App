import Matiere from '../models/Matiere.js';

class MatiereService {
    static async getAllMatieres() {
        const sql = "SELECT * FROM matieres";
        const result = await window.electronAPI.db.query(sql);
        if (result.data)
            return result.data.map(row => new Matiere(row.CodMat, row.NomMat));
        else
            return [];
    }

    static async getMatiereByCode(CodMat) {
        const sql = "SELECT * FROM matieres WHERE CodMat = ?";
        const rows = await window.electronAPI.db.query(sql, [CodMat]);
        if (rows?.data.length === 0) return null;
        const row = rows.data[0];
        return new Matiere(row.CodMat, row.NomMat);
    }

    static async createMatiere(matiere) {
        const sql = "INSERT INTO matieres (CodMat, NomMat) VALUES (?, ?)";
        const result = await window.electronAPI.db.query(sql, [matiere.CodMat, matiere.NomMat]);
        return result;
    }

    static async updateMatiere(matiere) {
        const sql = "UPDATE matieres SET NomMat = ? WHERE CodMat = ?";
        const result = await window.electronAPI.db.query(sql, [matiere.NomMat, matiere.CodMat]);
        return result;
    }

    static async deleteMatiere(CodMat) {
        const sql = "DELETE FROM matieres WHERE CodMat = ?";
        const result = await window.electronAPI.db.query(sql, [CodMat]);
        return result;
    }
}

export default MatiereService;
