import Composer from '../models/Composer.js';

class ComposerController {
    static async getAllComposers() {
        const sql = "SELECT * FROM composer";
        const rows = await window.electronAPI.db.query(sql);
        return rows.map(row => new Composer(row.Num_Ins, row.Cod_Mat, row.Date_Compo, row.Note, row.Type, row.numPeriode));
    }

    static async getComposerByNumIns(numIns) {
        const sql = "SELECT * FROM composer WHERE Num_Ins = ?";
        const rows = await window.electronAPI.db.query(sql, [numIns]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return new Composer(row.Num_Ins, row.Cod_Mat, row.Date_Compo, row.Note, row.Type, row.numPeriode);
    }

    static async createComposer(composer) {
        const sql = "INSERT INTO composer (Num_Ins, Cod_Mat, Date_Compo, Note, Type, numPeriode) VALUES (?, ?, ?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [composer.numIns, composer.codMat, composer.dateCompo, composer.note, composer.type, composer.numPeriode]);
        return result;
    }

    static async updateComposer(composer) {
        const sql = "UPDATE composer SET Note = ?, Type = ?, numPeriode = ? WHERE Num_Ins = ? AND Cod_Mat = ? AND Date_Compo = ?";
        const result = await window.electronAPI.db.query(sql, [composer.note, composer.type, composer.numPeriode, composer.numIns, composer.codMat, composer.dateCompo]);
        return result;
    }

    static async deleteComposer(numIns, codMat, dateCompo) {
        const sql = "DELETE FROM composer WHERE Num_Ins = ? AND Cod_Mat = ? AND Date_Compo = ?";
        const result = await window.electronAPI.db.query(sql, [numIns, codMat, dateCompo]);
        return result;
    }

}

export default ComposerController;