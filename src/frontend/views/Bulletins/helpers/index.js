import { ToWords } from "to-words";

const toWords = new ToWords({
  localeCode: "fr-FR",
  converterOptions: {
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
  },
});

function convertMoyennesToLetters(moyenne) {
  return toWords.convert(moyenne).toLowerCase();
}

function accorderStatut(Statut, Sexe) {
  if (Sexe === "M") return Statut;
  if (Statut === "Nouveau") return "Nouvelle";
  return Statut + "e";
}

function periodeToLettres(periodeLibelle) {
  const [numero, periode] = periodeLibelle.split(" ");
  if (numero === "1er") return "Premier " + periode;
  if (numero === "2ème") return "Deuxième " + periode;
  return "Troisième Trimestre";
}

function rangToOrdinal(rang, sexe) {
  let isExeco = String(rang).endsWith("ex");
  rang = parseInt(rang);
  let ordinalRang = "";

  if (rang === 1) {
    if (sexe === "M") ordinalRang = "1er";
    else ordinalRang = "1ère";
  } else {
    ordinalRang = String(rang) + "ème";
  }

  return isExeco ? ordinalRang + "Ex" : ordinalRang;
}

function calculerMoyenneInterro(notesInterro) {
  if (notesInterro.length === 0) return (0).toFixed(2);
  return (
    notesInterro.reduce((acc, val) => +acc + +val) / notesInterro.length
  ).toFixed(2);
}

function calculerMoyenneTotal(MI, devoirs, hasInterroNotes) {
  const notesDevoirs = Object.values(devoirs).filter(
    (devoir) => devoir !== "" && devoir !== undefined && devoir !== null
  );
  let moyenne = 0;

  if (notesDevoirs.length === 0) moyenne = Number(MI);
  else {
    const total = Number(MI) + notesDevoirs.reduce((acc, val) => +acc + +val);
    if (hasInterroNotes) {
      moyenne = total / (1 + notesDevoirs.length);
    } else moyenne = total / notesDevoirs.length;
  }
  return moyenne.toFixed(2);
}

function moyenneAppreciations(moyenne) {
  if (moyenne < 8) return "Médiocre";
  if (moyenne < 10) return "Insuffisant";
  if (moyenne < 12) return "Passable";
  if (moyenne < 14) return "Assez-bien";
  if (moyenne < 16) return "Bien";
  if (moyenne < 18) return "Très-bien";
  return "Excellent";
}

export {
  convertMoyennesToLetters,
  moyenneAppreciations,
  calculerMoyenneInterro,
  calculerMoyenneTotal,
  rangToOrdinal,
  periodeToLettres,
  accorderStatut
};
