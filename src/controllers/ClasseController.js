import Classe from '../models/Classe.js';

class ClasseController {
    static async getAllClasses() {
        const sql = "SELECT * FROM classes";
        const rows = await window.electronAPI.db.query(sql);
        if (rows.success) {
            return rows.data.map(row => new Classe(row.Num_Class, row.Nom_Class, row.Promotion, row.Num_Etabli));
        } else {
            return [];
        }
    }

    static async getClasseByNumClass(numClass) {
        const sql = "SELECT * FROM classes WHERE Num_Class = ?";
        const rows = await window.electronAPI.db.query(sql, [numClass]);
        if (rows.success && rows.data.length === 0)
            return null;
        else if (rows.success && rows.data.length > 0) {
            const row = rows.data[0];
            return new Classe(row.Num_Class, row.Nom_Class, row.Promotion, row.Num_Etabli);
        }

    }

    static async createClasse(classe) {
        const sql = "INSERT INTO classes (Nom_Class, Promotion, Num_Etabli) VALUES (?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [classe.nomClass, classe.promotion, classe.numEtabli]);
        return result;
    }

    static async updateClasse(classe) {
        const sql = "UPDATE classes SET Nom_Class = ?, Promotion = ?, Num_Etabli = ? WHERE Num_Class = ?";
        const result = await window.electronAPI.db.query(sql, [classe.nomClass, classe.promotion, classe.numEtabli, classe.numClass]);
        return result;
    }

    static async deleteClasse(numClass) {
        const sql = "DELETE FROM classes WHERE Num_Class = ?";
        const result = await window.electronAPI.db.query(sql, [numClass]);
        return result;
    }
}

export default ClasseController;
