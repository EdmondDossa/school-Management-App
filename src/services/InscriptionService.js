import Inscription from "../models/Inscription.js";

class InscriptionService {
  static async getAllInscriptions() {
    const sql = "SELECT * FROM inscriptions";
    const rows = await window.electronAPI.db.query(sql);
    return rows.map(
      (row) =>
        new Inscription(
          row.Num_Ins,
          row.Date_Ins,
          row.Statut,
          row.Matricule,
          row.Num_Class,
          row.Annee_Scolaire
        )
    );
  }

  static async getTotalInscrits(anneeScolaire = null) {
    let sql = "";
    if (!anneeScolaire) sql = "SELECT COUNT(NumIns) as total FROM inscriptions";
    else
      sql = `SELECT COUNT(*) as total FROM inscriptions WHERE AnneeScolaire = '${anneeScolaire}'`;
    const rows = await window.electronAPI.db.query(sql);
    return rows.data[0].total;
  }

  static async getEffectifsByClasse(anneeScolaire) {
    const sql =
      "SELECT NumClass, COUNT(NumIns) as total FROM inscriptions WHERE AnneeScolaire = ? GROUP BY NumClass";
    const rows = await window.electronAPI.db.query(sql, [anneeScolaire]);
    return rows.data.map((classe) => ({
        [classe.NumClass]:classe.total
    }));
  }

  static async getElevesInformations(Matricule,AnneeScolaire){
    const sql = "SELECT c.NomClass, i.Statut FROM inscriptions i JOIN classes c ON c.NumClass = i.NumClass WHERE AnneeScolaire = ? AND i.Matricule = ?";
    const rows = await window.electronAPI.db.query(sql, [AnneeScolaire,Matricule]);
    return rows.data[0];
  }

  static async getInscriptionByNum(numIns) {
    const sql = "SELECT * FROM inscriptions WHERE Num_Ins = ?";
    const rows = await window.electronAPI.db.query(sql, [numIns]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new Inscription(
      row.Num_Ins,
      row.Date_Ins,
      row.Statut,
      row.Matricule,
      row.Num_Class,
      row.Annee_Scolaire
    );
  }

  static async getInscriptionByMatricule(matricule) {
    const sql = "SELECT * FROM inscriptions WHERE Matricule = ?";
    const rows = await window.electronAPI.db.query(sql, [matricule]);
    return rows.map(
      (row) =>
        new Inscription(
          row.Num_Ins,
          row.Date_Ins,
          row.Statut,
          row.Matricule,
          row.Num_Class,
          row.Annee_Scolaire
        )
    );
  }

  static async getInscriptionByClasse(numClass) {
    const sql = "SELECT * FROM inscriptions WHERE Num_Class = ?";
    const rows = await window.electronAPI.db.query(sql, [numClass]);
    return rows.map(
      (row) =>
        new Inscription(
          row.Num_Ins,
          row.Date_Ins,
          row.Statut,
          row.Matricule,
          row.Num_Class,
          row.Annee_Scolaire
        )
    );
  }

  static async getInscriptionByAnneeScolaire(anneeScolaire) {
    const sql = "SELECT * FROM inscriptions WHERE AnneeScolaire = ?";
    const { data: rows } = await window.electronAPI.db.query(sql, [
      anneeScolaire,
    ]);
    return rows.map(
      (row) =>
        new Inscription(
          row.Num_Ins,
          row.Date_Ins,
          row.Statut,
          row.Matricule,
          row.Num_Class,
          row.Annee_Scolaire
        )
    );
  }

  static async createInscription(inscription) {
    const sql =
      "INSERT INTO inscriptions (Date_Ins, Statut, Matricule, Num_Class, Annee_Scolaire) VALUES (?, ?, ?, ?, ?)";
    const result = await window.electronAPI.db.query(sql, [
      inscription.dateIns,
      inscription.statut,
      inscription.matricule,
      inscription.numClass,
      inscription.anneeScolaire,
    ]);
    return result;
  }

  static async insertManyInClass(matricules, NumClass, AnneeScolaire) {
    //on doit définir le statut de l'étudiant à inscrire
    //s'il existe déjà dans  la table inscription pour une mm classe et une annee anterieure alors il est doublant/ redoublant
    //s'il n'existe pas  il est nouveau

    const query1 =
      "SELECT Matricule from inscriptions WHERE NumClass = ? AND AnneeScolaire != ?";
    const oldClassStudents = (
      await window.electronAPI.db.query(query1, [NumClass, AnneeScolaire])
    ).data.map((e) => e.Matricule);

    const values = matricules
      .map((matricule) => {
        let Statut = "";
        if (!oldClassStudents.includes(matricule)) {
          Statut = "Nouveau";
        } else {
          const occurences = oldClassStudents.filter(
            (m) => m === matricule
          ).length;
          Statut = occurences > 1 ? "Redoublant" : "Doublant";
        }

        return `('${Statut}','${matricule}','${NumClass}','${AnneeScolaire}')`;
      })
      .join(",");
    const sql = `INSERT INTO inscriptions (Statut,Matricule,NumClass,AnneeScolaire) VALUES ${values} ON CONFLICT (Matricule,AnneeScolaire) DO NOTHING`;
    const result = await window.electronAPI.db.query(sql);
    return result;
  }

  static async updateInscription(inscription) {
    const sql =
      "UPDATE inscriptions SET Date_Ins = ?, Statut = ?, Matricule = ?, Num_Class = ?, Annee_Scolaire = ? WHERE Num_Ins = ?";
    const result = await window.electronAPI.db.query(sql, [
      inscription.dateIns,
      inscription.statut,
      inscription.matricule,
      inscription.numClass,
      inscription.anneeScolaire,
      inscription.numIns,
    ]);
    return result;
  }

  static async deleteInscription(numIns) {
    const sql = "DELETE FROM inscriptions WHERE Num_Ins = ?";
    const result = await window.electronAPI.db.query(sql, [numIns]);
    return result;
  }
  static async deleteInscriptionByMatricule(matricule,anneeScolaire) {
    const sql = "DELETE FROM inscriptions WHERE Matricule = ? AND AnneeScolaire = ?";
    const result = await window.electronAPI.db.query(sql, [matricule,anneeScolaire]);
    return result;
  }
}

export default InscriptionService;
