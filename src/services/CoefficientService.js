import Coefficient from '../models/Coefficient.js';

class CoefficientService {
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
        const sql = "INSERT INTO coefficientsMatieres (CodMat, Coef, Annee, NumClass) VALUES (?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [coefficient.CodMat, coefficient.Coef, coefficient.Annee, coefficient.NumClass]);
        return result;
    }

    static async update(codmat,numclass,annee,coef) {
            console.log(coef,annee,numclass,codmat);
            
        const sql = "UPDATE coefficientsMatieres SET Coef = ? WHERE Annee = ? AND NumClass = ? AND CodMat = ?";
        const result = await window.electronAPI.db.query(sql, [coef,annee,numclass,codmat]);
        return result;
    }

    static async deleteCoefficient(codMat,Annee, NumClass) {
        const sql = "DELETE FROM coefficientsMatieres WHERE CodMat = ? AND Annee = ? AND NumClass = ?";
        const result = await window.electronAPI.db.query(sql, [codMat,Annee, NumClass]);
        return result;
    }
}

export default CoefficientService;
