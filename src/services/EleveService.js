import Eleve from '../models/Eleve.js';

class EleveService {
    static async getAllEleves() {
        const sql = "SELECT * FROM eleves";
        const rows = await window.electronAPI.db.query(sql);
        if (rows.success) {
            return rows.data.map(row => new Eleve(row.Matricule, row.Nom, row.Prenoms, row.Sexe, row.DateNaissance, row.LieuNaissance, row.Nationalite, row.ContactParent, row.NumEtabli));
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
        return new Eleve(row.Matricule, row.Nom, row.Prenoms, row.Sexe, row.DateNaissance, row.LieuNaissance, row.Nationalite, row.ContactParent, row.NumEtabli);
    }

    static async createEleve(eleve) {
        const sql = "INSERT INTO eleves (Matricule, Nom, Prenoms, Sexe, DateNaissance, LieuNaissance, Nationalite, ContactParent, NumEtabli) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [eleve.matricule, eleve.nomEleve, eleve.prenomEleve, eleve.sexe, eleve.dateNaissance, eleve.lieuNaissance, eleve.nationalite, eleve.contactParent, eleve.numEtabli]);
        return result;
    }

    static async updateEleve(eleve) {
        const sql = "UPDATE eleves SET Nom = ?, Prenoms = ?, Sexe = ?, DateNaissance = ?, LieuNaissance = ?, Nationalite = ?, ContactParent = ?, NumEtabli = ? WHERE Matricule = ?";
        const result = await window.electronAPI.db.query(sql, [eleve.nomEleve, eleve.prenomEleve, eleve.sexe, eleve.dateNaissance, eleve.lieuNaissance, eleve.nationalite, eleve.contactParent, eleve.numEtabli, eleve.matricule]);
        return result;
    }

    static async deleteEleve(matricule) {
        const sql = "DELETE FROM eleves WHERE Matricule = ?";
        const result = await window.electronAPI.db.query(sql, [matricule]);
        return result;
    }
}

export default EleveService;
