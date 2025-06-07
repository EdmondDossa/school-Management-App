class Professeur {
  constructor(
    NumProf,
    NomProf,
    PrenomProf,
    Sexe,
    Adresse,
    Telephone,
    Email,
    DateNaissance,
    LieuNaissance,
    Nationalite,
    matieres = []
  ) {
    this.NumProf = NumProf;
    this.NomProf = NomProf;
    this.PrenomsProf = PrenomProf;
    this.Sexe = Sexe;
    this.Adresse = Adresse;
    this.Telephone = Telephone;
    this.Email = Email;
    this.DateNaissance = DateNaissance;
    this.LieuNaissance = LieuNaissance;
    this.Nationalite = Nationalite;
    this.matieres = matieres;
  }
}

export default Professeur;
