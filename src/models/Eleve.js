class Eleve {
    constructor(matricule, nom, prenoms, sexe, dateNaissance, lieuDeNaissance, nationalite, contactEtudiant, Etablissement) {
        this.Matricule = matricule;
        this.Nom = nom;
        this.Prenoms = prenoms;
        this.Sexe = sexe;
        this.DateNaissance = dateNaissance;
        this.LieuDeNaissance = lieuDeNaissance;
        this.Nationalite = nationalite;
        this.NontactEtudiant = contactEtudiant;
        this.NumEtabli = Etablissement
    }
}

export default Eleve;
