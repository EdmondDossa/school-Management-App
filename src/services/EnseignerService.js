import Enseigner from '../models/Enseigner.js';
import Matiere from '../models/Matiere.js';
import Professeur from '../models/Professeur.js';

class EnseignerService {
    
    static async getMatieresNonEncoreAssigneeAClasse(Annee,NumClass) {
        //on recupere toutes les matieres qui ne sont pas encore  enseignee 
        // dans  la classe en question pour l'annee scolaire en cours et on 
        //recupere avec les professseurs qui font ces matieres
        
        const sql = `
                SELECT a.NumProf,a.NomProf,b.CodMat,b.NomMat
                FROM professeurs a RIGHT JOIN matieres b 
                ON a.CodMat = b.CodMat 
                WHERE b.CodMat NOT IN(
                    SELECT CodMat FROM professeurs a JOIN enseigner e
                    ON a.NumProf = e.NumProf WHERE e.Annee = ? AND e.NumClass = ?
                ) 


        `;
        
        const { data:rows } = await window.electronAPI.db.query(sql,[Annee,NumClass]);

        let matieresEnregistree = [];
        let matieresNonAssignees = [];

        //on recupere les matieres sans doublons parce qu'il y aura des matieres disponibles
        //dupliquees dans les cas ou plusieurs prof peuvent enseigner une mm matiere
        for (const row of rows){
            if(!matieresEnregistree.includes(row.CodMat)){
                matieresEnregistree.push(row.CodMat);
                matieresNonAssignees.push(
                    new Matiere(
                        row.CodMat,
                        row.NomMat
                    )
                );
            }
        }

        const professeursCorrespondants =  rows.map(
            (row) =>
              new Professeur(
                row.NumProf,
                row.NomProf,
                row.PrenomsProf,
                row.Sexe,
                row.Adresse,
                row.Telephone,
                row.Email,
                row.DateNaissance,
                row.LieuNaissance,
                row.Nationalite,
                row.CodMat
              )
          );


        return { 
            professeursCorrespondants, 
            matieresNonAssignees 
        };
    }

    static async getEnseignements(Annee,NumClass) {
        //on recupere pour l'annee scolaire en cours et pour une classe en question
        //la liste des matieres et  des  professeurs qui font deja cours dans la salle
        //en ajoutant les coefficients correspondants
        const sql = `
                SELECT a.NumProf,a.NomProf,b.CodMat,b.NomMat,c.Coef
                FROM professeurs a JOIN matieres b 
                ON a.CodMat = b.CodMat 
                JOIN coefficientsMatieres c ON b.CodMat = c.CodMat
                WHERE a.NumProf IN(
                    SELECT a.NumProf FROM professeurs a JOIN enseigner b
                    ON a.NumProf = b.NumProf WHERE b.Annee = ? AND b.NumClass = ?
                )
                AND c.Annee = ? AND c.NumClass = ?

        `;
        
        const { data:rows } = await window.electronAPI.db.query(sql,[Annee,NumClass,Annee,NumClass]);
        
        return rows;
    }


    static async createEnseignement(enseignement) {
        const sql = "INSERT INTO enseigner (NumProf, NumClass, NumEtabli, Annee) VALUES (?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [enseignement.NumProf,enseignement.NumClass, enseignement.NumEtabli, enseignement.Annee]);
        return result;
    }

    static async deleteEnseignement(enseignement) {
        const sql = "DELETE FROM enseigner WHERE NumProf = ?  AND NumClass = ? AND Annee = ?";
        const result = await window.electronAPI.db.query(sql, [enseignement.NumProf, enseignement.NumClass,enseignement.Annee]);
        return result;
    }

    static async getEnseignementByAnnee(annee){
        const sql = "SELECT * FROM enseigner WHERE Annee = ?";
        const { data:rows } = await window.electronAPI.db.query(sql,[annee]);
        return rows;
    }
}

export default EnseignerService;
