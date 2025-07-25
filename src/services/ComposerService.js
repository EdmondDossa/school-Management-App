import Composer from "../models/Composer.js";

class ComposerService {
  static async getAllComposers() {
    const sql = "SELECT * FROM composer";
    const rows = await window.electronAPI.db.query(sql);
    return rows.map(
      (row) =>
        new Composer(
          row.Num_Ins,
          row.Cod_Mat,
          row.enregistree_le,
          row.Note,
          row.Type,
          row.Periode
        )
    );
  }
  static async getComposersByAnneeClassMatiere(
    Annee,
    numClass,
    CodMat,
    Periode
  ) {
    const sql =
      "SELECT c.Note,c.Type,c.NumIns FROM composer c JOIN inscriptions i ON i.NumIns = c.NumIns WHERE i.AnneeScolaire = ? AND i.NumClass = ? AND c.CodMat = ? AND Periode = ? ";
    const { data: rows } = await window.electronAPI.db.query(sql, [
      Annee,
      numClass,
      CodMat,
      Periode,
    ]);
    let sortedData = {};

    rows?.forEach?.((row) => {
      if (sortedData[row.NumIns]) {
        sortedData[row.NumIns] = {
          ...sortedData[row.NumIns],
          [row.Type]: row.Note,
        };
      } else sortedData[row.NumIns] = { [row.Type]: row.Note };
    });
    return sortedData;
  }

  static async getComposerByNumIns(numIns) {
    const sql = "SELECT * FROM composer WHERE Num_Ins = ?";
    const rows = await window.electronAPI.db.query(sql, [numIns]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new Composer(
      row.Num_Ins,
      row.Cod_Mat,
      row.enregistree_le,
      row.Note,
      row.Type,
      row.numPeriode
    );
  }

  static async create(composer) {
    const sql =
      "INSERT INTO composer (NumIns, CodMat, enregistree_le, Note, Type, numPeriode) VALUES (?, ?, ?, ?, ?)";
    const result = await window.electronAPI.db.query(sql, [
      composer.NumIns,
      composer.CodMat,
      composer.Note,
      composer.Type,
      composer.Periode,
    ]);
    return result;
  }

  static async setComposer(composer) {
    const sql = `
            INSERT INTO composer (NumIns, CodMat, Note, Type, Periode)
            VALUES (?,?,?,?,?)
            ON CONFLICT (NumIns,CodMat,Periode,Type)
            DO UPDATE 
            SET Note = ? WHERE NumIns = ? AND CodMat = ? AND Type = ? AND Periode = ?
        `;
    const result = await window.electronAPI.db.query(sql, [
      composer.NumIns,
      composer.CodMat,
      composer.Note,
      composer.Type,
      composer.Periode,
      composer.Note,
      composer.NumIns,
      composer.CodMat,
      composer.Type,
      composer.Periode,
    ]);
    return result;
  }

  static async updateComposer(composer) {
    const sql =
      "UPDATE composer SET Note = ?, Type = ?, numPeriode = ? WHERE Num_Ins = ? AND Cod_Mat = ? AND enregistree_le = ?";
    const result = await window.electronAPI.db.query(sql, [
      composer.note,
      composer.type,
      composer.numPeriode,
      composer.numIns,
      composer.codMat,
      composer.enregistree_le,
    ]);
    return result;
  }

  static async deleteComposer(numIns, codMat, periode, type) {
    const sql =
      "DELETE FROM composer WHERE NumIns = ? AND CodMat = ? AND Periode = ? AND Type = ?";
    const result = await window.electronAPI.db.query(sql, [
      numIns,
      codMat,
      periode,
      type,
    ]);
    return result;
  }
}

export default ComposerService;
