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

  static async getComposersByAnneeClass(Annee, numClass, Periode) {
    const sql =
      "SELECT c.Note,c.Type,c.NumIns,c.CodMat FROM composer c JOIN inscriptions i ON i.NumIns = c.NumIns WHERE i.AnneeScolaire = ? AND i.NumClass = ? AND Periode = ? GROUP BY c.NumIns,c.CodMat,c.Type,c.Note";
    const { data: rows } = await window.electronAPI.db.query(sql, [
      Annee,
      numClass,
      Periode,
    ]);

    //on veut trier les donnees regroupees de sorte d'avoir un tableau dans le format
    /**
     * [
     *  {
     *      NumIns:'..',
     *      matieres:{
     *        CodMat1:{
     *          interro:[],
     *          devoirs:[ { type:note } ]
     *        },
     *        CodMat2: ....
     *      }
     *  }
     * ]
     *
     * Ce tri sera utile pour faciliter dans les vues le calcul des moyennes par classe et par matieres
     * afin de faire le ranking
     */

    //les donnees provenant de la bdd sont groupees par matricule
    //c'est à dire que toutes les notes de chaque étudiant sont d'abord listées avant de passer à un
    //autre étudiant.

    let lastSavedMatricule = ""; //l'étudiant dont les notes sont entrain d'etre traitées
    let data = {}; // l'ensemble des info sur ses notes
    const result = []; //le tableau final qui va recevoir data après chaque fin de traitement d'un etudiant

    if (rows.length > 0) {
      for (let i = 0; i < rows.length; i++) {
        //on vérifie si on n'est passé à un autre étudiant
        if (rows[i]?.NumIns === lastSavedMatricule) {
          //si des notes n'ont pas déjà été enrégistré pour la matiere en cours
          if (!data.matieres[rows[i].CodMat]) {
            data.matieres[rows[i].CodMat] = {
              devoirs: [],
              interro: [],
            };
          }

          //on ranges les notes selon leurs types
          if (rows[i].Type.startsWith("I")) {
            data.matieres[rows[i].CodMat].interro = [
              ...data.matieres[rows[i].CodMat].interro,
              rows[i].Note,
            ];
          } else
            data.matieres[rows[i].CodMat].devoirs = {
              ...data.matieres[rows[i].CodMat].devoirs,
              [rows[i].Type]: rows[i].Note,
            };
        } else {
          //quand on passe à un nouvel étudiant
          data = {
            NumIns: rows[i].NumIns,
            matieres: {
              [rows[i].CodMat]: {
                interro: [],
                devoirs: {},
              },
            },
          };

          if (rows[i].Type.startsWith("I"))
            data.matieres[rows[i].CodMat].interro.push(rows[i].Note);
          else
            data.matieres[rows[i].CodMat].devoirs = {
              [rows[i].Type]: rows[i].Note,
            };
          result.push(data);
        }
        lastSavedMatricule = rows[i].NumIns;
      }
    }
    return result;
  }

  static async getComposerByNumIns(numIns) {
    const sql = "SELECT * FROM composer WHERE NumIns = ? GROUP BY CodMat";
    const { data: rows } = await window.electronAPI.db.query(sql, [numIns]);
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
