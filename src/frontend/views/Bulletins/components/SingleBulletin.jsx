import React, { useEffect, useState } from "react";
import { InscriptionService } from "../../../../services";
import BulletinRow from "./BulletinRow";
import {
  convertMoyennesToLetters,
  moyenneAppreciations,
  rangToOrdinal,
  periodeToLettres,
  accorderStatut,
} from "../helpers";
import BulletinRecapitulatif from "../../../../models/BulletinRecapitulatif";
import BulletinRecapitulatifService from "../../../../services/BulletinRecapitulatifService";
import BulletinPeriodeRecapitulatif from "./BulletinPeriodeRecapitulatif";

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

const SingleBulletin = ({
  etablissement,
  NumIns,
  classe,
  effectif,
  Annee,
  periodeEnCours,
  shouldHaveD3Field,
  matieres,
  elevesNotes,
  statistiquesGlobales,
  sortedElevesByMoyenneMatieres,
  sortedElevesByMoyenneGenerale,
}) => {
  const [isLoading, setLoading] = useState(true);
  const [eleve, setEleve] = useState({});
  const [currentStudentNotes, setCurrentStudentNotes] = useState({});
  const [matieresRanking, setMatieresRanking] = useState({});
  const [generalRanking, setGeneralRanking] = useState("");
  const [bulletinExists, setBulletinExists] = useState(false);
  const [recapitulatifSaved, setRecapitulatifSaved] = useState(false);

  async function fetchEleveInfo() {
    try {
      setLoading(true);
      //informations de l'étudiant
      let result = await InscriptionService.getEleveByNumIns(NumIns);
      setEleve(result);
      //on retrouve ses notes
      const currentEleve = elevesNotes.find(
        (eleve) => eleve.NumIns === +NumIns
      );
      //s'il n'avait pas du tout de notes on ne peut pas voir son bulletin
      if (currentEleve) {
        setBulletinExists(true);
      } else {
        setLoading(false);
        return;
      }
      setCurrentStudentNotes(currentEleve);
      //on cherche son rang par matières
      makeMatieresRanking();
      //son rang general
      makeGeneralRanking();
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  function makeMatieresRanking() {
    const codematieres = matieres.map((matiere) => matiere.CodMat);
    let ranking = {};

    codematieres.forEach((codemat) => {
      //pour trouver le rang de l'eleve actuel et verifier si il est execo ou non
      //trouver  l'eleve actuel
      const sortedNotes = sortedElevesByMoyenneMatieres[codemat].values;

      let currentEleveIndex = sortedNotes.findIndex(
        (eleve) => eleve.NumIns === +NumIns
      );

      //on verifie si sa moyenne existe plus d'une fois
      let eleveMoyenne = sortedNotes[currentEleveIndex].matieres[codemat]["MT"];
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
      ranking = { ...ranking, [codemat]: rang };
    });
    setMatieresRanking(ranking);
  }

  function makeGeneralRanking() {
    // Trouver le rang sem/trimestriel
    const currentEleveIndex = sortedElevesByMoyenneGenerale.findIndex(
      (eleve) => eleve.NumIns === +NumIns
    );
    const eleveMoyenne =
      sortedElevesByMoyenneGenerale[currentEleveIndex].moyenneTotale;
    const moyenneIndex = sortedElevesByMoyenneGenerale.findIndex(
      (eleve) => eleve.moyenneTotale === eleveMoyenne
    );
    let moyenneExistsMoreThanOnce = false;
    if (
      sortedElevesByMoyenneGenerale[moyenneIndex + 1] &&
      sortedElevesByMoyenneGenerale[moyenneIndex + 1].moyenneTotale ===
        eleveMoyenne
    ) {
      moyenneExistsMoreThanOnce = true;
    }
    const ranking = moyenneExistsMoreThanOnce
      ? String(moyenneIndex + 1) + "ex"
      : moyenneIndex + 1;

    setGeneralRanking(ranking);
  }

  async function saveBulletinRecapitulatif() {
    const res = await BulletinRecapitulatifService.create(
      NumIns,
      periodeEnCours,
      generalRanking,
      currentStudentNotes.moyenneTotale
    );
    if (res.success) setRecapitulatifSaved(true);
  }

  useEffect(() => {
    if (NumIns) fetchEleveInfo();
  }, [NumIns]);

  useEffect(() => {
    if (generalRanking) saveBulletinRecapitulatif();
  }, [generalRanking]);

  if (isLoading) return <></>;
  if (!bulletinExists) {
    return (
      <section className="w-[990px] h-[100px] bg-slate-100 place-content-center font-extrabold text-gray-500 text-center text-xl  p-2 border border-black mx-auto">
        {" "}
        L'élève {eleve?.Nom} {eleve?.Prenoms} n'a aucune note pour le{" "}
        {periodeEnCours}. Son bulletin n'est donc pas disponible.{" "}
      </section>
    );
  }

  return (
    <>
      <section className="bulletin-container w-[990px]  bg-gray-100 px-8 py-4 font-sans min-h-[950px] mx-auto ">
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
                    <th> Classe: </th>
                    <td> {classe.NomClass} </td>
                  </tr>
                  <tr>
                    <th> Effectif: </th>
                    <td> {effectif} </td>
                  </tr>
                  <tr>
                    <th> Statut:</th>
                    <td> {accorderStatut(eleve.Statut, eleve.Sexe)} </td>
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
                      matieresRanking[matiere.CodMat],
                      eleve.Sexe
                    )}
                    statistiques={
                      sortedElevesByMoyenneMatieres[matiere.CodMat].statistiques
                    }
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
                {rangToOrdinal(generalRanking, eleve.Sexe)}{" "}
              </span>
            </div>
          </div>
          <div className="h-[130px] w-[200px]">
            <h2 className="text-center bg-gray-600 mb-1 pb-2 underline text-white">
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
        {recapitulatifSaved && (
          <BulletinPeriodeRecapitulatif
            NumIns={NumIns}
            periodeEnCours={periodeEnCours}
            Sexe={eleve.Sexe}
          />
        )}
      </section>
      <div className="mb-10"></div>
    </>
  );
};

export default React.memo(SingleBulletin);
