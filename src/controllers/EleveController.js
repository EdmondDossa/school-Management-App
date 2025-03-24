import Eleve from '../models/Eleve.js';

class EleveController {
    static async getAllEleves() {
        const sql = "SELECT * FROM eleves";
        const rows = await window.electronAPI.db.query(sql);
        if (rows.success) {
            return [
                {
                    id: 1,
                    Matricule: "M000001",
                    Nom: "DOSSA HEGNON",
                    Prenom: "Marie Edmond",
                    DateNaissance: "21-11-2002",
                    LieuNaissance: "Athiémé",
                    Nationalite: "Béninoise",
                    ContactParent: "+229 95777753",
                    NumEtabli: 1
                }
            ]
            //return rows.data.map(row => new Eleve(row.Matricule, row.NomEleve, row.PrenomEleve, row.Sexe, row.DateNaissance, row.LieuNaissance, row.Nationalite, row.ContactParent, row.NumEtabli));
        } else {
            toast.error('Erreur lors du chargement des eleves');
            return [];
        }
    }

    static async getEleveByMatricule(matricule) {
        const sql = "SELECT * FROM eleves WHERE Matricule = ?";
        const rows = await window.electronAPI.db.query(sql, [matricule]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return new Eleve(row.Matricule, row.NomEleve, row.PrenomEleve, row.Sexe, row.DateNaissance, row.LieuNaissance, row.Nationalite, row.ContactParent, row.NumEtabli);
    }

    static async createEleve(eleve) {
        const sql = "INSERT INTO eleves (Matricule, NomEleve, PrenomEleve, Sexe, DateNaissance, LieuNaissance, Nationalite, ContactParent, NumEtabli) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [eleve.matricule, eleve.nomEleve, eleve.prenomEleve, eleve.sexe, eleve.dateNaissance, eleve.lieuNaissance, eleve.nationalite, eleve.contactParent, eleve.numEtabli]);
        return result;
    }

    static async updateEleve(eleve) {
        const sql = "UPDATE eleves SET NomEleve = ?, PrenomEleve = ?, Sexe = ?, DateNaissance = ?, LieuNaissance = ?, Nationalite = ?, ContactParent = ?, NumEtabli = ? WHERE Matricule = ?";
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
