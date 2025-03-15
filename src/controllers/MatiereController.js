import Matiere from '../models/Matiere.js';

class MatiereController {
    static async getAllMatieres() {
        const sql = "SELECT * FROM matieres";
        const rows = await window.electronAPI.db.query(sql);
        return rows.map(row => new Matiere(row.Cod_Mat, row.Nom_Mat));
    }

    static async getMatiereByCode(codMat) {
        const sql = "SELECT * FROM matieres WHERE Cod_Mat = ?";
        const rows = await window.electronAPI.db.query(sql, [codMat]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return new Matiere(row.Cod_Mat, row.Nom_Mat);
    }

    static async createMatiere(matiere) {
        const sql = "INSERT INTO matieres (Cod_Mat, Nom_Mat) VALUES (?, ?)";
        const result = await window.electronAPI.db.query(sql, [matiere.codMat, matiere.nomMat]);
        return result;
    }

    static async updateMatiere(matiere) {
        const sql = "UPDATE matieres SET Nom_Mat = ? WHERE Cod_Mat = ?";
        const result = await window.electronAPI.db.query(sql, [matiere.nomMat, matiere.codMat]);
        return result;
    }

    static async deleteMatiere(codMat) {
        const sql = "DELETE FROM matieres WHERE Cod_Mat = ?";
        const result = await window.electronAPI.db.query(sql, [codMat]);
        return result;
    }
}

export default MatiereController;
