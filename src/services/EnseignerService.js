
class EnseignerService {
    static async getMatieresNonEncoreAssigneeAClasse(Annee,NumClass) {
        //on recupere les matieres disponibles
        const sql = `
            SELECT CodMat,NomMat FROM matieres WHERE 
            CodMat NOT IN (SELECT CodMat FROM enseigner WHERE Annee = ? AND NumClass = ?)
        `;
        const { data:matieresNonAssignees } = await window.electronAPI.db.query(sql,[Annee,NumClass]);
        return matieresNonAssignees;
    }

    static async getEnseignementByProfesseur(NumProf,Annee){
        const sql=`
              SELECT p.NumProf,p.NomProf,p.PrenomsProf,c.NomClass,e.NumClass
              FROM enseigner e 
              JOIN professeurs p ON p.NumProf = e.NumProf
              JOIN classes c ON c.NumClass = e.NumClass WHERE p.NumProf = ? AND e.Annee = ? 
        `;
        const result = await window.electronAPI.db.query(sql,[NumProf,Annee]);
        return result;
    }


    static async getEnseignementByAnnee(annee){
        const sql = "SELECT * FROM enseigner WHERE Annee = ?";
        const { data:rows } = await window.electronAPI.db.query(sql,[annee]);
        return rows;
    }

    static async getEnseignements(Annee,NumClass) {
        //on recupere pour l'annee scolaire en cours et pour une classe en question
        //la liste des matieres et  des  professeurs qui font deja cours dans la salle
        //en ajoutant les coefficients correspondants
        const sql = `
                SELECT p.NumProf,p.NomProf,p.PrenomsProf,e.CodMat,m.NomMat,c.Coef,e.id
                FROM professeurs p 
                JOIN enseigner e ON e.NumProf = p.NumProf
                JOIN matieres m ON m.CodMat = e.CodMat
                JOIN coefficientsMatieres c ON e.CodMat = c.CodMat
                WHERE c.Annee = ? AND c.NumClass = ? AND e.Annee = ? AND e.NumClass = ?
        `;
        const { data:rows } = await window.electronAPI.db.query(sql,[Annee,NumClass,Annee,NumClass]);
        return rows;
    }

    static async createEnseignement(enseignement) {
        const sql = "INSERT INTO enseigner (NumProf, NumClass, CodMat, Annee) VALUES (?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [enseignement.NumProf,enseignement.NumClass, enseignement.CodMat, enseignement.Annee]);
        return result;
    }

    static async updateEnseignement(enseignement){
        const sql = "UPDATE enseigner SET NumProf = ?, CodMat = ? WHERE id = ?";
        const result = await window.electronAPI.db.query(sql, [enseignement.NumProf,enseignement.CodMat, enseignement.id]);
        return result;
    }
    static async deleteEnseignement(id) {
        const sql = "DELETE FROM enseigner WHERE id = ?";
        const result = await window.electronAPI.db.query(sql, [id]);
        return result;
    }



    static async deleteEnseignementByMatiere(CodMat,Annee){
        const sql = "DELETE FROM enseigner WHERE CodMat = ? AND Annee = ?";
        const result = await window.electronAPI.db.query(sql,[String(CodMat),Annee]);
        return result;
    }

    static async deleteEnseignementByProfesseur(NumProf,Annee){
        const sql = "DELETE FROM enseigner WHERE NumProf = ? AND Annee = ?";
        const result = await window.electronAPI.db.query(sql, [NumProf,Annee]);
        return result;
    }


}

export default EnseignerService;
