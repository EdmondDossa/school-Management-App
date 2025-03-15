import Coefficient from '../models/Coefficient.js';

class CoefficientController {
    static async getAllCoefficients() {
        const sql = "SELECT * FROM coefficientsMatieres";
        const rows = await window.electronAPI.db.query(sql);
        return rows.map(row => new Coefficient(row.Cod_Mat, row.Coef, row.Num_Etabli, row.Annee, row.Num_Class));
    }

    static async getCoefficientByCodMat(codMat, Num_Etabli, Annee, Num_Class) {
        const sql = "SELECT * FROM coefficientsMatieres WHERE Cod_Mat = ?, Num_Etabli = ?, Annee = ?, Num_Class = ?";
        const rows = await window.electronAPI.db.query(sql, [codMat, Num_Etabli, Annee, Num_Class]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return new Coefficient(row.Cod_Mat, row.Coef, row.Num_Etabli, row.Annee, row.Num_Class);
    }

    static async createCoefficient(coefficient) {
        const sql = "INSERT INTO coefficientsMatieres (Cod_Mat, Coef, Num_Etabli, Annee, Num_Class) VALUES (?, ?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [coefficient.codMat, coefficient.coef, coefficient.numEtabli, coefficient.annee, coefficient.numClass]);
        return result;
    }

    static async updateCoefficient(coefficient) {
        const sql = "UPDATE coefficientsMatieres SET Coef = ?, Num_Etabli = ?, Annee = ?, Num_Class = ? WHERE Cod_Mat = ?";
        const result = await window.electronAPI.db.query(sql, [coefficient.coef, coefficient.numEtabli, coefficient.annee, coefficient.numClass, coefficient.codMat]);
        return result;
    }

    static async deleteCoefficient(codMat, Num_Etabli, Annee, Num_Class) {
        const sql = "DELETE FROM coefficientsMatieres WHERE Cod_Mat = ?, Num_Etabli = ?, Annee = ?, Num_Class = ?";
        const result = await window.electronAPI.db.query(sql, [codMat, Num_Etabli, Annee, Num_Class]);
        return result;
    }
}

export default CoefficientController;
