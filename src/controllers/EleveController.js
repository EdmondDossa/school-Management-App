import Eleve from '../models/Eleve.js';

class EleveController {
    static async getAllEleves() {
        const sql = "SELECT * FROM eleves";
        const rows = await window.electronAPI.db.query(sql);
        return rows.map(row => new Eleve(row.Matricule, row.Nom_Eleve, row.Prenom_Eleve, row.Sexe, row.Date_Naissance, row.Lieu_Naissance, row.Nationalite, row.ContactParent, row.Num_Etabli));
    }

    static async getEleveByMatricule(matricule) {
        const sql = "SELECT * FROM eleves WHERE Matricule = ?";
        const rows = await window.electronAPI.db.query(sql, [matricule]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return new Eleve(row.Matricule, row.Nom_Eleve, row.Prenom_Eleve, row.Sexe, row.Date_Naissance, row.Lieu_Naissance, row.Nationalite, row.ContactParent, row.Num_Etabli);
    }

    static async createEleve(eleve) {
        const sql = "INSERT INTO eleves (Matricule, Nom_Eleve, Prenom_Eleve, Sexe, Date_Naissance, Lieu_Naissance, Nationalite, ContactParent, Num_Etabli) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [eleve.matricule, eleve.nomEleve, eleve.prenomEleve, eleve.sexe, eleve.dateNaissance, eleve.lieuNaissance, eleve.nationalite, eleve.contactParent, eleve.numEtabli]);
        return result;
    }

    static async updateEleve(eleve) {
        const sql = "UPDATE eleves SET Nom_Eleve = ?, Prenom_Eleve = ?, Sexe = ?, Date_Naissance = ?, Lieu_Naissance = ?, Nationalite = ?, ContactParent = ?, Num_Etabli = ? WHERE Matricule = ?";
        const result = await window.electronAPI.db.query(sql, [eleve.nomEleve, eleve.prenomEleve, eleve.sexe, eleve.dateNaissance, eleve.lieuNaissance, eleve.nationalite, eleve.contactParent, eleve.numEtabli, eleve.matricule]);
        return result;
    }

    static async deleteEleve(matricule) {
        const sql = "DELETE FROM eleves WHERE Matricule = ?";
        const result = await window.electronAPI.db.query(sql, [matricule]);
        return result;
    }
}

export default EleveController;
