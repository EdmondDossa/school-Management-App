import React, { useEffect, useState } from "react";
import ButtonBack from "../../components/ButtonBack";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import SectionHead from "./components/SectionHead";
import {
  ClasseService,
  ComposerService,
  EleveService,
  EnseignerService,
  InscriptionService,
} from "../../../services";
import { electronAlert, getAnneeScolaire, getEtablissement } from "../../utils";
import BulletinRow from "./components/BulletinRow";
import { convertMoyennesToLetters } from "./helpers";

const tableHeadFields = [
  "DISCIPLINES",
  "Coef",
  "Moy Interr",
  "Dev.1",
  "Dev.2",
  "Dev.3",
  "Moy. /20",
  "Moy. Coef",
  "Rang",
  "Moy. Fble",
  "Moy. Frte",
  "Moy. Class.",
  "Appéciations du Professeur",
];

const Bulletins = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const NumClass = searchParams.get("numClass");
  const Matricule = searchParams.get("matricule");
  const { NumIns } = useParams();

  const [etablissement, setEtablissement] = useState({});
  const [eleve, setEleve] = useState({});
  const [classe, setClasse] = useState({});
  const [Annee, setAnnee] = useState("");
  const [matieres, setMatieres] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [effectif, setEffectif] = useState(0);
  const [InscriptionInfo, setInscriptionInfo] = useState({});
  const [periodeEnCours, setPeriodeEnCours] = useState("");
  const [currentStudentNotes, setCurrentStudentNotes] = useState({});
  const [statistiquesMatieres, setStatistiquesMatieres] = useState({});
  const [statistiquesGlobales, setStatistiquesGlobales] = useState({});

  async function fetchAppData() {
    try {
      setLoading(true);
      //informations sur l'annee scolaire
      let result = await getEtablissement();
      setEtablissement(result);

      //informations de l'étudiant
      result = await EleveService.getEleveByMatricule(Matricule);
      setEleve(result);

      //informations sur la classe
      result = await ClasseService.getClasseByNumClass(NumClass);
      setClasse(result);

      //l'annee en cours
      const { Annee } = await getAnneeScolaire();
      setAnnee(Annee);

      //effectif de la salle
      result = await InscriptionService.getEffectifsByClasse(Annee);
      setEffectif(result[NumClass]);

      //informations de l'etudiant dans la salle
      result = await InscriptionService.getInscriptionByNum(NumIns);
      setInscriptionInfo(result);

      //periode de l'annee
      const periode = await window.electronAPI.store.get("periodeEncours");
      setPeriodeEnCours(periode);

      //les matieres enseignees dans la classe
      const matieres = await EnseignerService.getEnseignements(Annee, NumClass);
      setMatieres(matieres ?? []);

      //recuperer toutes les notes de toutes les matieres de chaque etudiant de la classe en question
      const elevesNotes = await ComposerService.getComposersByAnneeClass(
        Annee,
        NumClass,
        periode
      );

      //si l'eleve n'a aucune note impossible de calculer sa moyenne
      const userHasNote = elevesNotes.find((eleve) => eleve.NumIns === +NumIns);

      if (!userHasNote) {
        const ok = await electronAlert(
          "L'élève sélectionné n'a aucune note enrégistrée pour la période en cours. Pour accéder à son bulletin,veuillez lui  ajouter au moins une note."
        );
        if (ok) navigate(-1);
      }

      const codeMatieres = matieres.map((matiere) => matiere.CodMat);

      //statistiques relatives aux matieres

      //calculer les moyennes de tous les eleves pour chaque matieres
      elevesNotes.forEach((eleve) => {
        codeMatieres.forEach((codmat) => {
          if (!eleve.matieres[codmat]) {
            //si l'élève n'a aucune note pour cette matiere
            eleve.matieres[codmat] = { MI: (0).toFixed(2), MT: (0).toFixed(2) };
          } else {
            eleve.matieres[codmat]["MI"] = calculerMoyenneInterro(
              eleve.matieres[codmat]?.interro ?? []
            );
            eleve.matieres[codmat]["MT"] = calculerMoyenneTotal(
              +eleve.matieres[codmat]["MI"],
              eleve.matieres[codmat]?.devoirs ?? [],
              eleve.matieres[codmat]?.interro?.length > 0
            );
          }
        });
      });

      //faire le ranking des moyennes de chaque eleve par matieres
      let statistiques = {};
      codeMatieres.forEach((codemat) => {
        let sortedNotes = Array.from(elevesNotes).sort(
          (eleve1, eleve2) =>
            +eleve2.matieres[codemat]["MT"] - +eleve1.matieres[codemat]["MT"]
        );

        const moyenneForte = sortedNotes[0].matieres[codemat]["MT"];
        const moyenneFaible = sortedNotes.at(-1).matieres[codemat]["MT"];
        const moyenneSalle =
          sortedNotes
            .map((item) => +item.matieres[codemat]["MT"])
            .reduce((acc, val) => acc + val) / elevesNotes.length;

        //trouver le rang de l'utilisateur actuel
        const rang =
          sortedNotes.findIndex((eleve) => eleve.NumIns === +NumIns) + 1;

        statistiques = {
          ...statistiques,
          [codemat]: {
            moyenneForte,
            moyenneFaible,
            moyenneSalle: moyenneSalle.toFixed(2),
            rang,
          },
        };
      });
      setStatistiquesMatieres(statistiques);

      //somme des coefficients
      let totalCoeff = matieres
        .map((matiere) => +matiere.Coef)
        .reduce((acc, val) => acc + val);

      //statistiques globales de la salle

      //moyennes générales
      elevesNotes.forEach((eleve) => {
        eleve.moyenneTotaleCoeff = matieres
          .map(
            (matiere) => +eleve.matieres[matiere.CodMat]["MT"] * +matiere.Coef
          )
          .reduce((acc, val) => acc + val);
        eleve.moyenneTotale = eleve.moyenneTotaleCoeff / totalCoeff;
      });

      //faire le classements
      let sortedMoyennes = Array.from(elevesNotes).sort(
        (eleve1, eleve2) => eleve2.moyenneTotale - eleve1.moyenneTotale
      );
      let statistiquesGlobales = {};

      const rangGeneral =
        sortedMoyennes.findIndex((eleve) => eleve.NumIns === +NumIns) + 1;
      const moyenneForteGenerale = sortedMoyennes[0].moyenneTotale;
      const moyenneFaibleGenerale = sortedMoyennes.at(-1).moyenneTotale;
      const moyenneClasseGenerale =
        sortedMoyennes
          .map((eleve) => +eleve.moyenneTotale)
          .reduce((acc, val) => acc + val) / elevesNotes.length;

      statistiquesGlobales = {
        moyenneClasseGenerale,
        moyenneFaibleGenerale,
        moyenneForteGenerale,
        rangGeneral,
        totalCoeff,
      };

      setStatistiquesGlobales(statistiquesGlobales);

      //recuperer les donnees bulletin de l'étudiant en cours
      const note = elevesNotes?.find((n) => n.NumIns === +NumIns);
      setCurrentStudentNotes(note);

      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchAppData();
  }, []);

  if (isLoading) return <SectionHead />;
  
  return (
    <>
      <ButtonBack />
      <section className="w-[940px] font-sans h-[950px] mx-auto border border-gray-500">
        {/* Entete pour les info de l'établissement */}
        <div className="flex justify-between items-center content-center text-center border-b border-black px-2">
          <div className="w-24 h-24">
            <img
              src={`app://resources/images/etablissements/${etablissement.Logo}`}
              alt=""
            />
          </div>
          <div>
            <span className="block text-md">Rébublique du Bénin</span>
            <strong className="block uppercase">{`COMPLEXE SCOLAIRE ${etablissement.NomEtabli} `}</strong>
            <span className="block">
              {" "}
              {` Contact:  ${etablissement.Telephone} ${
                etablissement.Email ? `- ${etablissement.Email}` : ""
              } `}
            </span>
            <span className="block"> {etablissement.Adresse} </span>
          </div>
          <div className="w-24 h-24">
            <img
              src={`app://resources/images/etablissements/${etablissement.Logo}`}
              alt=""
            />
          </div>{" "}
        </div>
        <hr className="mt-2 h-1 bg-black " />
        <div className="flex gap-4 px-2 mt-2 text-sm">
          <div className="w-1/2 h-24 border p-2 overflow-hidden border-black rounded-md bg-gray-100">
            <table className="font-semibold">
              <tbody className="[&_th]:min-w-[200px] [&_th]:text-start">
                <tr>
                  <th> {eleve.Matricule} </th>
                  <td className="truncate">
                    {" "}
                    {eleve.Nom + " " + eleve.Prenoms}{" "}
                  </td>
                </tr>
                <tr>
                  <th> Né (e) le: </th>
                  <td>
                    {`${eleve.DateNaissance?.split("-")?.[2]}`} /
                    {`${eleve.DateNaissance?.split("-")?.[1]}`}/
                    {`${eleve.DateNaissance?.split("-")?.[0]}`}
                  </td>
                </tr>
                <tr>
                  <th> Sexe: </th>
                  <td> {eleve.Sexe === "M" ? "Masculin" : "Féminin"} </td>
                </tr>
                <tr>
                  <th> Lieu:</th>
                  <td> {eleve.LieuNaissance} </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-1/2 flex gap-x-3">
            <div className="w-full border px-2 border-black rounded-md bg-gray-100">
              <table className="font-semibold">
                <tbody className="[&_th]:min-w-[200px] [&_th]:text-start">
                  <tr>
                    <th> Classe </th>
                    <td> {classe.NomClass} </td>
                  </tr>
                  <tr>
                    <th> Effectif: </th>
                    <td> {effectif} </td>
                  </tr>
                  <tr>
                    <th> Statut</th>
                    <td>
                      {" "}
                      {accorderStatut(InscriptionInfo.statut, eleve.Sexe)}{" "}
                    </td>
                  </tr>
                  <tr>
                    <th>Année Scolaire:</th>
                    <td> {Annee} </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="w-[150px] border border-black"></div>
          </div>
        </div>
        <div>
          <div className="border border-black mt-2">
            <h1 className="uppercase text-lg text-center py-1 font-bold">
              {" "}
              Bulletin de notes du {periodeToLettres(periodeEnCours)}{" "}
            </h1>
          </div>
          <table className="border">
            <thead>
              <tr>
                {tableHeadFields.map((field) => (
                  <th
                    className="border border-black p-2 font-semibold text-sm"
                    key={field}
                  >
                    {" "}
                    {field}{" "}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matieres?.map((matiere) => {
                const item =
                  currentStudentNotes?.matieres[matiere.CodMat] ?? {};
                return (
                  <BulletinRow
                    key={matiere.CodMat}
                    matiere={matiere}
                    MI={item["MI"]}
                    MT={item["MT"]}
                    D1={item.devoirs?.["D1"]}
                    D2={item.devoirs?.["D2"]}
                    D3={item.devoirs?.["D3"]}
                    rang={rangToOrdinal(
                      statistiquesMatieres[matiere.CodMat].rang,
                      eleve.Sexe
                    )}
                    statistiques={statistiquesMatieres[matiere.CodMat]}
                    appreciations={moyenneAppreciations(+item["MT"])}
                  />
                );
              })}
              <tr className="border-b-2 border-black ">
                <td className="text-lg font-bold border  border-black">
                  {" "}
                  TOTAUX{" "}
                </td>
                <td className="border text-sm text-center font-bold border-black">
                  {statistiquesGlobales.totalCoeff.toFixed(2)}
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td className="text-center text-sm font-bold border border-black">
                  {currentStudentNotes.moyenneTotaleCoeff.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex mt-2 gap-x-1 justify-between">
          <div className="h-12 items-center truncate ms-1 text-md p-2 flex gap-x-2 w-1/2 rounded-md ">
            <div className="block items-center">Moyenne:</div>{" "}
            <div className="bg-gray-300 flex items-center">
              <span className="text-md border-r-2 block p-1 border-white font-bold font-sans">
                {currentStudentNotes.moyenneTotale.toFixed(2)}{" "}
              </span>
              <span className="text-[12px] p-1 block italic">
                (
                {convertMoyennesToLetters(
                  +currentStudentNotes.moyenneTotale.toFixed(2)
                )}
                )
              </span>
            </div>
            <div className="text-sm">
              <span className="font-sans font-semibold">Rang :</span>
              <span className="inline-block  text-sm  font-bold bg-gray-300 p-1">
                {" "}
                {rangToOrdinal(
                  statistiquesGlobales.rangGeneral,
                  eleve.Sexe
                )}{" "}
              </span>
            </div>
          </div>
          <div className="h-[130px] w-[200px]">
            <h2 className="text-center bg-gray-600 mb-1 p-[2px] text-white">
              Bilan de la classe
            </h2>
            <div className="mt-1 flex justify-between items-center text-sm border border-black">
              <span className="block">Moy. Faible</span>
              <strong className="block border-l w-[62px] py-1 ps-4 pe-1 border-black  ">
                {" "}
                {statistiquesGlobales.moyenneFaibleGenerale.toFixed(2)}{" "}
              </strong>
            </div>
            <div className="mt-1 flex justify-between items-center text-sm border border-black">
              <span className="block">Moy. Forte</span>
              <strong className="block border-l py-1 w-[62px] ps-4 pe-1 border-black  ">
                {" "}
                {statistiquesGlobales.moyenneForteGenerale.toFixed(2)}{" "}
              </strong>
            </div>
            <div className="mt-1 flex justify-between items-center text-sm border border-black">
              <span className="block">Moy. de la classe</span>
              <strong className="block border-l py-1 w-[62px] ps-4 pe-1 border-black  ">
                {" "}
                {statistiquesGlobales.moyenneClasseGenerale.toFixed(2)}{" "}
              </strong>
            </div>
          </div>
          <div className="border p-1 border-black">
            <span className="text-center truncate mb-4 underline px-4 text-sm">
              Apréciations du Professeur Principal
            </span>
            <div className="flex items-center ">
              <div className="w-[200px] py-2">
                <div className="flex ">
                  <span className="block translate-y-[3px] me-2 text-sm">
                    Travail
                  </span>
                  <span className="block text-nowrap whitespace-nowrap font-semibold text-sm border-b border-black border-dotted px-10  text-center italic">
                    {moyenneAppreciations(currentStudentNotes.moyenneTotale)}
                  </span>
                </div>
                <span className="block border-b mt-5 border-black border-dotted w-[200px]"></span>
                <span className="block border-b mt-5 border-black border-dotted w-[200px]"></span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-32 border border-black mt-1 flex">
          <div className="w-2/5 border-r border-black p-2">
            <h5 className="text-sm text-center underline">
              Récompenses et Sanctions
            </h5>
            {[
              "Félicitations",
              "Encouragements",
              "Tableau d'honneur",
              "Blâme",
            ].map((critere) => (
              <div
                key={critere}
                className="flex items-center text-sm mt-1 gap-x-3"
              >
                <span className="h-5 w-5 border-[3px] border-black"></span>{" "}
                {critere}
              </div>
            ))}
          </div>
          <div className="w-3/5">
            <h5 className="text-sm text-center underline">
              Appréciations, Signature et Cachet du chef de l'établissement
            </h5>
            <span className="block text-center mt-1 italic">
              {" "}
              {moyenneAppreciations(currentStudentNotes.moyenneTotale)}{" "}
            </span>
            <span className="block text-center mt-1 font-semibold text-sm">
              Le Directeur
            </span>
          </div>
        </div>
      </section>
    </>
  );
};

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
  if (rang === 1) {
    if (sexe === "M") return "1er";
    else return "1ère";
  } else {
    return String(rang) + "ème";
  }
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

export default Bulletins;
