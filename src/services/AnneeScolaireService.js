import AnneeScolaire from '../models/AnneeScolaire.js';

class AnneeScolaireService {
    static async getAllAnneesScolaires() {
        const sql = "SELECT * FROM annees_scolaires";
        const result = await window.electronAPI.db.query(sql);
        if (result.success) {
            return result.data.map(an => new AnneeScolaire(an.Annee, an.DateDebut, an.DateFin, an.Periodicite));
        }
        return [];
    }

    static async getAnneeScolaireByAnnee(annee) {
        const sql = "SELECT * FROM annees_scolaires WHERE Annee = ?";
        const result = await window.electronAPI.db.query(sql, [annee]);
        if (result.success) {
            if (result.data.length === 0) return null;
            const row = result.data[0];
            return new AnneeScolaire(row.Annee, row.DateDebut, row.DateFin, row.Periodicite);
        }
    }

    static async createAnneeScolaire(anneeScolaire) {
        const sql = "INSERT INTO annees_scolaires (Annee, DateDebut, DateFin, Periodicite) VALUES (?, ?, ?, ?)";
        const result = await window.electronAPI.db.query(sql, [anneeScolaire.annee, anneeScolaire.dateDebut, anneeScolaire.dateFin, anneeScolaire.periodicite]);
        return result;
    }

    static async updateAnneeScolaire(anneeScolaire) {
        const sql = "UPDATE annees_scolaires SET DateDebut = ?, DateFin = ?, Periodicite = ? WHERE Annee = ?";
        const result = await window.electronAPI.db.query(sql, [anneeScolaire.dateDebut, anneeScolaire.dateFin, anneeScolaire.periodicite, anneeScolaire.annee]);
        return result;
    }

    static async deleteAnneeScolaire(annee) {
        const sql = "DELETE FROM annees_scolaires WHERE Annee = ?";
        const result = await window.electronAPI.db.query(sql, [annee]);
        return result

    }
}

export default AnneeScolaireService;
