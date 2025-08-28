import React, { useEffect, useState } from "react";
import AnneeScolaireService from "../../../services/AnneeScolaireService";
import ClasseService from "../../../services/ClasseService";
import toast from "react-hot-toast";
import { getAnneeScolaire } from "../../utils";
import { useParams } from "react-router-dom";
import ButtonBack from "../../components/ButtonBack";
import { Card, CardContent } from "../../components/Card";
import NoteRow from "./components/NoteRow.jsx";
import { Highlighter, Search } from "lucide-react";
import Input from "../../components/Input.jsx";
import {
  ComposerService,
  EnseignerService,
  InscriptionService,
} from "../../../services";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../../components/CTable.jsx";

const trimestres = ["1er Trimestre", "2ème Trimestre", "3ème Trimestre"];

const semestres = ["1er Semestre", "2ème Semestre"];

const NotesPanel = () => {
  const [anneesScolaires, setAnneesScolaires] = useState([]);
  const [selectedAnneesScolaire, setSelectedAnneesScolaire] = useState("");
  const [eleves, setEleves] = useState([]);
  const [classesMatieres, setClassesMatieres] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState("");
  const [notes, setNotes] = useState(null);
  const [currentClasse, setCurrentClasse] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [selectedPeriode, setSelectedPeriode] = useState("");
  const [etablissementPeriode, setEtablissementPeriode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { numClass } = useParams();

  async function fetchAppData() {
    try {
      setLoading(true);
      const anneescolaire = await AnneeScolaireService.getAllAnneesScolaires();
      setAnneesScolaires(anneescolaire.data);
      const anneeEnCours = await getAnneeScolaire();
      setSelectedAnneesScolaire(anneeEnCours.Annee);
      setEtablissementPeriode(anneeEnCours.Periodicite);
      const classe = await ClasseService.getClasseByNumClass(numClass);
      setCurrentClasse(classe);
      const matieres = await EnseignerService.getEnseignements(
        anneeEnCours.Annee,
        numClass
      );
      setClassesMatieres(matieres);

      if (matieres.length > 0) setSelectedMatiere(matieres[0].CodMat);
      const periode = await window.electronAPI.store.get("periodeEncours");
      if (!periode) {
        setSelectedPeriode(
          anneeEnCours.Periodicite === "Trimestre"
            ? trimestres[0]
            : semestres[0]
        );
      } else setSelectedPeriode(periode);
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }

  async function fetchNotes() {
    const notes = await ComposerService.getComposersByAnneeClassMatiere(
      selectedAnneesScolaire,
      numClass,
      selectedMatiere,
      selectedPeriode
    );
    setNotes(notes);
  }

  async function fetchEleves() {
    const eleves = await InscriptionService.getElevesByAnneeScolaireAndClasse(
      selectedAnneesScolaire,
      numClass
    );
    setEleves(eleves);
  }

  async function handlePeriodeChange(e) {
    setSelectedPeriode(e.target.value);
    await window.electronAPI.store.set("periodeEncours", e.target.value);
  }

  useEffect(() => {
    fetchAppData();
  }, []);

  useEffect(() => {
    if (selectedPeriode) {
      fetchNotes();
    }
  }, [selectedMatiere, selectedPeriode]);

  useEffect(() => {
    if (selectedAnneesScolaire) {
      fetchEleves();
    }
  }, [selectedAnneesScolaire]);

  const filteredEleves = eleves.filter((eleve) =>
    `${eleve.Nom} ${eleve.Prenoms}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (isLoading || !notes) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <ButtonBack />
      <div className="max-w-7xl mx-auto sticky bg-white -top-5  z-40 ">
        <div className="sticky bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Highlighter className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Gestion des notes - {currentClasse.NomClass}{" "}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <select
                id="anneeScolaire"
                value={selectedAnneesScolaire}
                onChange={(e) => setSelectedAnneesScolaire(e.target.value)}
                className="block order-2 rounded-md border-gray-300 shadow-sm py-2 px-3 outline-none focus:border-blue-500 outline-none focus:ring-blue-500 sm:text-sm"
              >
                {anneesScolaires.map((annee) => (
                  <option key={annee.Annee} value={annee.Annee}>
                    Année: {annee.Annee}
                  </option>
                ))}
              </select>
              <select
                id="matieres"
                value={selectedMatiere}
                onChange={(e) => setSelectedMatiere(e.target.value)}
                className="block rounded-md border-gray-300 shadow-sm py-2 px-3 outline-none focus:border-blue-500 outline-none focus:ring-blue-500 sm:text-sm"
              >
                {classesMatieres.length === 0 && (
                  <option value="">Matière:Aucune assignée</option>
                )}
                {classesMatieres.map((matiere) => (
                  <option key={matiere.CodMat} value={matiere.CodMat}>
                    Matière: {matiere.NomMat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-x-5 items-center font-bold text-gray-500">
              {(etablissementPeriode === "Trimestre"
                ? trimestres
                : semestres
              ).map((periode) => (
                <div key={periode}>
                  <label className="cursor-pointer" htmlFor={periode}>
                    {" "}
                    {periode}{" "}
                  </label>
                  <input
                    id={periode}
                    onChange={handlePeriodeChange}
                    checked={periode === selectedPeriode}
                    className="cursor-pointer w-5 h-3"
                    type="radio"
                    value={periode}
                  />
                </div>
              ))}
            </div>
            <div className="relative">
              <Input
                type="search"
                placeholder="Rechercher un élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-3 pr-[28px] py-2 border w-[350px] border-gray-300 rounded-md"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="grid gap-6 max-w-7xl mx-auto">
          <Card className=" overflow-x-auto">
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="[&_th]:text-center">
                    <TableHead
                      className="w-[40px] border-r-2 border-gray-100"
                      rowSpan="2"
                    >
                      Numéro
                    </TableHead>
                    <TableHead
                      className="w-[300px] border-r-2 border-gray-100"
                      rowSpan="2"
                    >
                      Nom Prénom
                    </TableHead>
                    <TableHead
                      className="border-r-2 border-gray-100"
                      colSpan="3"
                    >
                      Interrogations
                    </TableHead>
                    <TableHead
                      className="border-r-2 border-gray-100"
                      colSpan="3"
                    >
                      Devoirs
                    </TableHead>
                    <TableHead
                      className="border-l-2 border-gray-200"
                      colSpan="2"
                    >
                      Moyenne
                    </TableHead>
                  </TableRow>
                  <TableRow className="[&_th]:border-r-2 border-gray-100 [&_th]:text-center">
                    {["I1", "I2", "I3", "D1", "D2", "D3"].map((item) => (
                      <TableHead key={item}> {item} </TableHead>
                    ))}
                    <TableHead className="bg-slate-400 font-bold text-white">
                      MI
                    </TableHead>
                    <TableHead className="border-0 font-bold text-white border-white bg-blue-600">
                      MT
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEleves.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-gray-400 text-md text-center"
                      >
                        {searchTerm
                          ? `Aucun élève correspondant au terme "${searchTerm}"`
                          : "Aucun élève inscrit dans cette classe."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEleves.map((eleve, i) => (
                      <NoteRow
                        index={i + 1}
                        key={eleve.NumIns}
                        eleve={eleve}
                        CodMat={selectedMatiere}
                        Periode={selectedPeriode}
                        NumClass={numClass}
                        oldNotes={
                          notes[eleve.NumIns] ?? {
                            MI: (0).toFixed(2),
                            MT: (0).toFixed(2),
                          }
                        }
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotesPanel;
