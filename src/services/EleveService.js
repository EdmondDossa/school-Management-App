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
        const { data:rows }= await window.electronAPI.db.query(sql, [matricule]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return new Eleve(row.Matricule, row.Nom, row.Prenoms, row.Sexe, row.DateNaissance, row.LieuNaissance, row.Nationalite, row.ContactParent, row.NumEtabli);
    }

    static async createEleve(eleve) {
        const sql = "INSERT INTO eleves (Matricule, Nom, Prenoms, Sexe, DateNaissance, LieuNaissance, Nationalite, ContactParent, NumEtabli) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [eleve.Matricule, eleve.Nom, eleve.Prenoms, eleve.Sexe, eleve.DateNaissance, eleve.LieuNaissance, eleve.Nationalite, eleve.ContactParent, eleve.NumEtabli]);
        return result;
    }

    static async updateEleve(eleve) {
        const sql = "UPDATE eleves SET Nom = ?, Prenoms = ?, Sexe = ?, DateNaissance = ?, LieuNaissance = ?, Nationalite = ?, ContactParent = ?, NumEtabli = ? WHERE Matricule = ?";
        const result = await window.electronAPI.db.query(sql, [eleve.Nom, eleve.Prenoms, eleve.Sexe, eleve.DateNaissance, eleve.LieuNaissance, eleve.Nationalite, eleve.ContactParent, eleve.NumEtabli, eleve.Matricule]);
        return result;
    }

    static async deleteEleve(matricule) {
        const sql = "DELETE FROM eleves WHERE Matricule = ?";
        const result = await window.electronAPI.db.query(sql, [matricule]);
        return result;
    }

    static async searchEleve(searchTherm){
        const sql = "SELECT * FROM eleves WHERE Matricule =? OR Nom LIKE ? OR Prenoms LIKE ? OR Nationalite LIKE ?";
        const result = await window.electronAPI.db.query(sql, new Array(4).fill(searchTherm) );
        return result;
    }
}

export default EleveService;
