class Eleve {
    constructor(matricule, nom, prenom, sexe, dateNaissance, lieuDeNaissance, nationalite, contactEtudiant, Etablissement) {
        this.Matricule = matricule;
        this.Nom = nom;
        this.Prenom = prenom;
        this.Sexe = sexe;
        this.DateNaissance = dateNaissance;
        this.LieuDeNaissance = lieuDeNaissance;
        this.Nationalite = nationalite;
        this.NontactEtudiant = contactEtudiant;
        this.NumEtabli = Etablissement
    }
}

export default Eleve;
