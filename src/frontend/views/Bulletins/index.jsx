import React, { useEffect, useState } from "react";
import ButtonBack from "../../components/ButtonBack";
import { useParams, useSearchParams } from "react-router-dom";
import SectionHead from "./components/SectionHead";
import {  getAnneeScolaire, getEtablissement } from "../../utils";
import SingleBulletin from "./components/SingleBulletin";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import {
  calculerMoyenneInterro,
  calculerMoyenneTotal,
} from "./helpers";

import {
  ClasseService,
  ComposerService,
  EnseignerService,
  InscriptionService,
} from "../../../services";


const Bulletins = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const NumClass = searchParams.get("numClass");
  const { NumIns } = useParams();

  const [etablissement, setEtablissement] = useState({});
  const [classe, setClasse] = useState({});
  const [Annee, setAnnee] = useState("");
  const [matieres, setMatieres] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [effectif, setEffectif] = useState(0);
  const [elevesNotes, setElevesNotes] = useState(null);
  const [periodeEnCours, setPeriodeEnCours] = useState("");
  const [statistiquesGlobales, setStatistiquesGlobales] = useState({});
  const [shouldHaveD3Field, setShouldHaveD3Field] = useState(true); 
  const [sortedElevesByMoyenneMatieres, setSortedElevesByMoyenneMatieres] =
    useState({});
  const [sortedElevesByMoyenneGenerale, setSortedElevesByMoyenneGenerale] =
    useState([]);

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

      const codeMatieres = matieres.map((matiere) => matiere.CodMat);
      //verifier si la colonne D3 doit exister ou non
      const D3FieldExist = elevesNotes.some((eleve) => {
        return codeMatieres.some((codmat) => {
          const listDevoir = eleve?.matieres?.[codmat]?.devoirs;
          return listDevoir ? "D3" in listDevoir : false;
        });
      });
      setShouldHaveD3Field(D3FieldExist);

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

      //trouver la moyenne forte,faible de la classe par matiere
      let sortedByMatieres = {};
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

        sortedByMatieres = {
          ...sortedByMatieres,
          [codemat]: {
            values: sortedNotes,
            statistiques: {
              moyenneFaible: (+moyenneFaible).toFixed(2),
              moyenneForte: (+moyenneForte).toFixed(2),
              moyenneSalle: (+moyenneSalle).toFixed(2),
            },
          },
        };
      });

      setSortedElevesByMoyenneMatieres(sortedByMatieres);

      //somme des coefficients
      let totalCoeff = matieres
        .map((matiere) => +matiere.Coef)
        .reduce((acc, val) => acc + val);

      //calcul des moyennes générales
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

      setSortedElevesByMoyenneGenerale(sortedMoyennes);

      let statistiquesGlobales = {};
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
        totalCoeff,
      };
      setStatistiquesGlobales(statistiquesGlobales);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchAppData();
  }, []);

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
      <SectionHead
        isExporting={isExporting}
        handleExportPdf={handleExportPdf}
      />
      <SingleBulletin
        etablissement={etablissement}
        NumIns={NumIns}
        classe={classe}
        effectif={effectif}
        Annee={Annee}
        periodeEnCours={periodeEnCours}
        shouldHaveD3Field={shouldHaveD3Field}
        matieres={matieres}
        statistiquesGlobales={statistiquesGlobales}
        elevesNotes={elevesNotes}
        sortedElevesByMoyenneGenerale={sortedElevesByMoyenneGenerale}
        sortedElevesByMoyenneMatieres={sortedElevesByMoyenneMatieres}
      />
    </>
  );
};

export default Bulletins;
