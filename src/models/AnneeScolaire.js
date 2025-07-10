class AnneeScolaire {
  constructor(annee, dateDebut, dateFin, periodicite, id = null) {
    this.id = id;
    this.Annee = annee;
    this.DateDebut = dateDebut;
    this.DateFin = dateFin;
    this.Periodicite = periodicite;
  }
}

export default AnneeScolaire;
