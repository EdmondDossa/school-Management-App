class AnneeScolaire {
  constructor(annee, dateDebut, dateFin, periodicite, numEtabli, id = null) {
    this.id = id;
    this.Annee = annee;
    this.DateDebut = dateDebut;
    this.DateFin = dateFin;
    this.Periodicite = periodicite;
    this.NumEtabli = numEtabli;
  }
}

export default AnneeScolaire;
