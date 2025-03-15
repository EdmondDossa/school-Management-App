import Professeur from '../models/Professeur.js';

class ProfesseurController {
    static async getAllProfesseurs() {
        const sql = "SELECT * FROM professeurs";
        const rows = await window.electronAPI.db.query(sql);
        return rows.map(row => new Professeur(row.Num_Prof, row.Nom_Prof, row.Prenom_Prof, row.Sexe, row.Adresse, row.Telephone, row.Email, row.Date_Naissance, row.Lieu_Naissance, row.Nationalite));
    }

    static async getProfesseurByNum(numProf) {
        const sql = "SELECT * FROM professeurs WHERE Num_Prof = ?";
        const rows = await window.electronAPI.db.query(sql, [numProf]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return new Professeur(row.Num_Prof, row.Nom_Prof, row.Prenom_Prof, row.Sexe, row.Adresse, row.Telephone, row.Email, row.Date_Naissance, row.Lieu_Naissance, row.Nationalite);
    }

    static async createProfesseur(professeur) {
        const sql = "INSERT INTO professeurs (Nom_Prof, Prenom_Prof, Sexe, Adresse, Telephone, Email, Date_Naissance, Lieu_Naissance, Nationalite) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [professeur.nomProf, professeur.prenomProf, professeur.sexe, professeur.adresse, professeur.telephone, professeur.email, professeur.dateNaissance, professeur.lieuNaissance, professeur.nationalite]);
        return result;
    }

    static async updateProfesseur(professeur) {
        const sql = "UPDATE professeurs SET Nom_Prof = ?, Prenom_Prof = ?, Sexe = ?, Adresse = ?, Telephone = ?, Email = ?, Date_Naissance = ?, Lieu_Naissance = ?, Nationalite = ? WHERE Num_Prof = ?";
        const result = await window.electronAPI.db.query(sql, [professeur.nomProf, professeur.prenomProf, professeur.sexe, professeur.adresse, professeur.telephone, professeur.email, professeur.dateNaissance, professeur.lieuNaissance, professeur.nationalite, professeur.numProf]);
        return result;
    }

    static async deleteProfesseur(numProf) {
        const sql = "DELETE FROM professeurs WHERE Num_Prof = ?";
        const result = await window.electronAPI.db.query(sql, [numProf]);
        return result;
    }
}

export default ProfesseurController;
