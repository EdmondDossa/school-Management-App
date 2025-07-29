import React, { useEffect, useState } from "react";
import ButtonBack from "../../components/ButtonBack";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import SectionHead from "./components/SectionHead";
import { electronAlert, getAnneeScolaire, getEtablissement } from "../../utils";
import BulletinRow from "./components/BulletinRow";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  convertMoyennesToLetters,
  moyenneAppreciations,
  calculerMoyenneInterro,
  calculerMoyenneTotal,
  rangToOrdinal,
  periodeToLettres,
  accorderStatut,
} from "./helpers";

import {
  ClasseService,
  ComposerService,
  EleveService,
  EnseignerService,
  InscriptionService,
} from "../../../services";

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
  const [elevesNotes, setElevesNotes] = useState(null);
  const [periodeEnCours, setPeriodeEnCours] = useState("");
  const [currentStudentNotes, setCurrentStudentNotes] = useState({});
  const [statistiquesMatieres, setStatistiquesMatieres] = useState({});
  const [statistiquesGlobales, setStatistiquesGlobales] = useState({});
  const [shouldHaveD3Field, setShouldHaveD3Field] = useState(true); //decider de la presence ou non de la colonne D3 sur le bulletin

  const [isExporting, setIsExporting] = useState(false);

  async function fetchAppData() {
    try {
      setLoading(true);
      //informations sur l'annee scolaire
      let result = await getEtablissement();
      setEtablissement(result);

      //informations sur la classe
      result = await ClasseService.getClasseByNumClass(NumClass);
      setClasse(result);

      //l'annee en cours
      const { Annee } = await getAnneeScolaire();
      setAnnee(Annee);

      //effectif de la salle
      result = await InscriptionService.getEffectifsByClasse(Annee);
      setEffectif(result[NumClass]);

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
      setElevesNotes(elevesNotes);

      //informations de l'étudiant
      result = await EleveService.getEleveByMatricule(Matricule);
      setEleve(result);

      //informations de l'etudiant dans la salle
      result = await InscriptionService.getInscriptionByNum(NumIns);
      setInscriptionInfo(result);

      const codeMatieres = matieres.map((matiere) => matiere.CodMat);

      //verifier si la colonne D3 doit exister ou non
      const D3FieldExist = elevesNotes.some((eleve) => {
        return codeMatieres.some((codmat) => {
          const listDevoir = eleve?.matieres?.[codmat]?.devoirs;
          return listDevoir ? "D3" in listDevoir : false;
        });
      });
      setShouldHaveD3Field(D3FieldExist);

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

        //pour trouver le rang de l'eleve actuel et verifier si il est execo ou non
        //trouver  l'eleve actuel
        let currentEleveIndex = sortedNotes.findIndex(
          (eleve) => eleve.NumIns === +NumIns
        );

        //on verifie si sa moyenne existe plus d'une fois
        let eleveMoyenne =
          sortedNotes[currentEleveIndex].matieres[codemat]["MT"];
        //on retrouve le premier eleve avec cette moyenne
        let moyenneIndex = sortedNotes.findIndex(
          (eleve) => eleve.matieres[codemat]["MT"] === eleveMoyenne
        );

        let moyenneExistsMoreThanOnce = false;

        //on verifie si l'index suivant c la mm moyenne
        if (
          sortedNotes[moyenneIndex + 1] &&
          sortedNotes[moyenneIndex + 1].matieres[codemat]["MT"] === eleveMoyenne
        ) {
          moyenneExistsMoreThanOnce = true;
        }

        //si la moyenne existe plus d'une fois alors on ajoute 'ex' à la fin
        const rang = moyenneExistsMoreThanOnce
          ? String(moyenneIndex + 1) + "ex"
          : moyenneIndex + 1;
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

      // Trouver le rang sem/trimestriel
      const currentEleveIndex = sortedMoyennes.findIndex(
        (eleve) => eleve.NumIns === +NumIns
      );
      const eleveMoyenne = sortedMoyennes[currentEleveIndex].moyenneTotale;
      const moyenneIndex = sortedMoyennes.findIndex(
        (eleve) => eleve.moyenneTotale === eleveMoyenne
      );
      let moyenneExistsMoreThanOnce = false;
      if (
        sortedMoyennes[moyenneIndex + 1] &&
        sortedMoyennes[moyenneIndex + 1].moyenneTotale === eleveMoyenne
      ) {
        moyenneExistsMoreThanOnce = true;
      }
      const rangGeneral = moyenneExistsMoreThanOnce
        ? String(moyenneIndex + 1) + "ex"
        : moyenneIndex + 1;

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

  useEffect(() => {
    async function checkCanSeeBulletin() {
      if (elevesNotes) {
        //si l'eleve n'a aucune note impossible de calculer sa moyenne
        const userHasNote = elevesNotes.find(
          (eleve) => eleve.NumIns === +NumIns
        );

        if (!userHasNote) {
          const ok = await electronAlert(
            "L'élève sélectionné n'a aucune note enrégistrée pour la période en cours. Pour accéder à son bulletin,veuillez lui  ajouter au moins une note."
          );
          if (ok) navigate(-1);
        }
      }
    }
    checkCanSeeBulletin();
  }, [elevesNotes]);

  if (isLoading) return <SectionHead />;

  // New function to handle PDF export
  const handleExportPdf = async () => {
    setIsExporting(true);
    const input = document.getElementById("bulletin-container");
    if (!input) {
      console.error("Element with ID 'bulletin-container' not found.");
      return;
    }
    
    const flagSpans = document.querySelectorAll(".benin-flag");
    flagSpans.forEach((flag) => (flag.style.top = "7px"));


    try {
      const scheduleCanvas = await html2canvas(input, {
        scale: 1,
        logging: false,
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
      });
      const pdf = new jsPDF("p", "px");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgData = scheduleCanvas.toDataURL("image/png");
      const imgWidth = scheduleCanvas.width;
      const imgHeight = scheduleCanvas.height;

      const ratio = pdfWidth / imgWidth;
      const imgHeightScaled = imgHeight * ratio;

      if (imgHeightScaled <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeightScaled);
      } else {
        let heightLeft = imgHeightScaled;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeightScaled);
        heightLeft -= pdfHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeightScaled;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeightScaled);
          heightLeft -= pdfHeight;
        }
      }

      pdf.save(`bulletin---.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF.");
    } finally {
      setIsExporting(false);
      flagSpans.forEach((flag) => (flag.style.top = "0"));
    }
  };

  return (
    <>
      <ButtonBack />
      <SectionHead isExporting={isExporting} handleExportPdf={handleExportPdf} />
      <section
        id="bulletin-container"
        className="w-[990px] bg-gray-100 px-8 py-4 font-sans min-h-[950px] mx-auto border "
      >
        {/* Entete pour les info de l'établissement */}
        <div className="flex justify-between items-center content-center text-center border-b border-black px-2 py-3">
          <div className="w-24 h-24">
            <img
              src={`app://resources/images/etablissements/${etablissement.Logo}`}
              alt=""
            />
          </div>
          <div>
            <div className="flex justify-center items-center gap-x-1">
              <span className="block w-5 h-4 benin-flag relative">
                <img
                  className="w-full h-full"
                  src="app://resources/images/default/benin_flag.png"
                  alt="Benin flag"
                />
              </span>
              <span className="block text-md uppercase">
                République du Bénin
              </span>{" "}
              <span className="block w-5 h-4 benin-flag relative">
                <img
                  className="w-full h-full"
                  src="app://resources/images/default/benin_flag.png"
                  alt="Benin flag"
                />
              </span>
            </div>
            <strong className="block uppercase">{`${etablissement.NomEtabli} `}</strong>
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
        <div className="flex gap-4  mt-2 text-sm">
          <div className="w-1/2 h-24 border px-2 overflow-hidden border-black rounded-md bg-gray-100">
            <table className="font-semibold">
              <tbody className="[&_th]:min-w-[200px] [&_th]:text-start">
                <tr>
                  <th> {eleve.Matricule} </th>
                  <td className="whitespace-nowrap">
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
                    <th> Statut:</th>
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
                {tableHeadFields.map((field) => {
                  return (
                    (field === "Dev.3" ? shouldHaveD3Field : true) && (
                      <th
                        className="border border-black p-2 font-semibold text-sm"
                        key={field}
                      >
                        {" "}
                        {field}{" "}
                      </th>
                    )
                  );
                })}
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
                    shouldHaveD3Field={shouldHaveD3Field}
                  />
                );
              })}
              <tr className="border-b-2 border-black ">
                <td className="text-lg font-bold border py-1 place-content-center ps-1 border-black">
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
          <div className="h-12 items-center whitespace-nowrap ms-1 text-md p-2 flex gap-x-2 w-1/2 rounded-md ">
            <div className="block items-center">Moyenne:</div>{" "}
            <div className="bg-gray-300 flex items-center">
              <span className="text-md border-r-2 pb-2 p-1  block  border-white font-bold font-sans">
                {currentStudentNotes.moyenneTotale.toFixed(2)}{" "}
              </span>
              <span className="text-[12px] pb-2 block italic">
                (
                {convertMoyennesToLetters(
                  +currentStudentNotes.moyenneTotale.toFixed(2)
                )}
                )
              </span>
            </div>
            <div className="text-sm">
              <span className="font-sans font-semibold">Rang :</span>
              <span className="inline-block pb-2 text-sm  font-bold bg-gray-300 p-1">
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
            <span className="text-center whitespace-nowrap mb-4 underline px-4 text-sm">
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
        <div className="h-36 border border-black mt-1 flex">
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
                className="flex items-center gap-x-1 text-sm p-1"
              >
                <div className="h-5 w-5 block border-[3px] border-black"></div>
                <div className={`h-[20px] relative -top-1`}>{critere}</div>
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

export default Bulletins;
