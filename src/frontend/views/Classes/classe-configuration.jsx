import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Modal } from "../../components";
import { DuplicateIcon } from "../../assets/icons/index.jsx";
import { SettingsIcon, Delete, Edit, PlusCircle } from "lucide-react";
import { Button } from "../../components/Bouton.jsx";
import ButtonBack from "../../components/ButtonBack.jsx";

import { getAnneeScolaire, electronConfirm } from "../../utils/";

import {
  EnseignerService,
  ClasseService,
  CoefficientService,
  ProfesseurService,
  MatiereService,
} from "../../../services/";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/Card.jsx";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/CTable.jsx";
import { Tooltip } from "react-tooltip";

const tableHeadFields = ["Matiere", "Professeur", "Coefficient", "Actions"];

const ClasseConfiguration = () => {
  const { id: NumClass } = useParams();

  const [InfoScolaire, setInfoScolaire] = useState({ Annee: "" });
  const [isLoading, setLoading] = useState(true);
  const [isLoadingComponentData, setLoadingComponentData] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [isUpdatingCoef, setIsUpdatingCoef] = useState(false);
  const [coefToUpdate, setCoefToUpdate] = useState(null);

  const [matieres, setMatieres] = useState([]);
  const [professeursByMatiere, setProfesseursByMatiere] = useState({});
  const [classe, setClasse] = useState({});
  const [enseignements, setEnseignements] = useState([]);
  const [newEnseignements, setNewEnseignements] = useState([]);

  const fetchInfoScolaire = useCallback(async () => {
    const { Annee } = await getAnneeScolaire();
    setInfoScolaire({ Annee });
    setLoading(false);
  }, []);

  const fetchMatieresNonAssignee = useCallback(async () => {
    if (InfoScolaire.Annee) {
      const matieresNonAssignees =
        await EnseignerService.getMatieresNonEncoreAssigneeAClasse(
          InfoScolaire.Annee,
          NumClass
        );
      setMatieres(matieresNonAssignees);
    }
  }, [InfoScolaire.Annee, NumClass]);

  const fetchCurrentClasse = useCallback(async () => {
    const result = await ClasseService.getClasseByNumClass(NumClass);
    setClasse(result);
  }, [NumClass]);

  const fetchEnseignements = useCallback(async () => {
    if (InfoScolaire.Annee) {
      const result = await EnseignerService.getEnseignements(
        InfoScolaire.Annee,
        NumClass
      );
      setEnseignements(result);
    }
  }, [InfoScolaire.Annee, NumClass]);

  const loadData = useCallback(async () => {
    setLoadingComponentData(true);
    await Promise.all([
      fetchCurrentClasse(),
      fetchMatieresNonAssignee(),
      fetchEnseignements(),
    ]);
    setLoadingComponentData(false);
  }, [fetchCurrentClasse, fetchMatieresNonAssignee, fetchEnseignements]);

  const addNewEnseignement = () => {
    setNewEnseignements([
      ...newEnseignements,
      { CodMat: "", NumProf: "", Coef: 1, key: Date.now() },
    ]);
  };

  const removeNewEnseignement = (key) => {
    setNewEnseignements(newEnseignements.filter((ens) => ens.key !== key));
  };

  const handleNewEnseignementChange = (key, field, value) => {
    const updatedEnseignements = newEnseignements.map((ens) =>
      ens.key === key ? { ...ens, [field]: value } : ens
    );
    setNewEnseignements(updatedEnseignements);

    if (field === "CodMat") {
      filterProfesseurByMatiere(value, key);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const matieresSet = new Set();
    for (const enseignement of newEnseignements) {
      if (matieresSet.has(enseignement.CodMat)) {
        const matiere = matieres.find((m) => m.CodMat === enseignement.CodMat);
        toast.error(
          `La matière "${matiere.NomMat}" est sélectionnée plusieurs fois.`
        );
        return;
      }
      matieresSet.add(enseignement.CodMat);
    }

    try {
      const promises = newEnseignements.map((enseignement) => {
        const enseignementData = {
          ...enseignement,
          Annee: InfoScolaire.Annee,
          NumClass,
        };
        const coefficientData = {
          CodMat: enseignement.CodMat,
          Coef: enseignement.Coef,
          NumClass,
          Annee: InfoScolaire.Annee,
        };
        return Promise.all([
          EnseignerService.createEnseignement(enseignementData),
          CoefficientService.createCoefficient(coefficientData),
        ]);
      });

      await Promise.all(promises);

      toast.success("Les cours ont bien été ajoutés");
      await loadData();
      closeModal();
    } catch (error) {
      toast.error("Une erreur est survenue.");
    }
  };

  const handleDelete = async (enseignement) => {
    const confirmDelete = await electronConfirm(
      "Etes vous sûr(e) de vouloir supprimer ce cours ?"
    );
    if (confirmDelete) {
      try {
        await EnseignerService.deleteEnseignement(enseignement.id);
        await CoefficientService.deleteCoefficient(
          enseignement.CodMat,
          InfoScolaire.Annee,
          NumClass
        );
        await loadData();
        toast.success("Enseignement supprimer avec succes");
      } catch (error) {
        console.log(error);
        toast.error("Une erreur est survenue lors de la suppression");
      }
    }
  };

  const handleCoefficientUpdate = async (CodMat, oldCoef) => {
    if (!coefToUpdate) return;
    if (oldCoef === coefToUpdate) return;
    if (coefToUpdate && coefToUpdate >= 1) {
      await CoefficientService.update(
        CodMat,
        NumClass,
        InfoScolaire.Annee,
        coefToUpdate
      );
      await fetchEnseignements();
      toast.success("Coefficient modifié!");
    } else {
      toast.error("Coefficient invalide");
    }
    setIsUpdatingCoef(false);
  };

  const filterProfesseurByMatiere = async (codMat, key) => {
    if (codMat) {
      const profs = await ProfesseurService.getProfesseurByCodMat(codMat);
      setProfesseursByMatiere((prev) => ({ ...prev, [key]: profs }));
    } else {
      setProfesseursByMatiere((prev) => ({ ...prev, [key]: [] }));
    }
  };

  const closeModal = () => {
    setOpenModal(false);
    setNewEnseignements([]);
    setProfesseursByMatiere({});
  };

  useEffect(() => {
    fetchInfoScolaire();
  }, [fetchInfoScolaire]);

  useEffect(() => {
    if (!isLoading) {
      loadData();
    }
  }, [isLoading, loadData]);

  if (isLoadingComponentData) return <div>Chargement ...</div>;

  return (
    <>
      <div>
        <div>
          <ButtonBack />
        </div>
        <main className="pt-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <SettingsIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">
                Configurer la classe de {classe.NomClass}{" "}
              </h1>
            </div>
            <Button
              onClick={() => {
                setNewEnseignements([
                  { CodMat: "", NumProf: "", Coef: 1, key: Date.now() },
                ]);
                setOpenModal(true);
              }}
            >
              <img src={DuplicateIcon} className="mr-2 h-4 w-4" />
              Ajouter des cours
            </Button>
          </div>
          <div className="grid gap-6">
            <Card className="m-auto w-full">
              <CardHeader>
                <CardTitle>Liste des cours</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {tableHeadFields.map((field) => (
                        <TableHead className="text-center" key={field}>
                          {field}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enseignements.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-gray-400 text-md text-center"
                        >
                          Aucun cours enregistré pour le moment
                        </TableCell>
                      </TableRow>
                    )}
                    {enseignements.map((enseignement, index) => (
                      <TableRow key={index}>
                        <TableCell> {enseignement.NomMat} </TableCell>
                        <TableCell>
                          {`${enseignement.NomProf} ${enseignement.PrenomsProf}`}
                        </TableCell>
                        <TableCell
                          id={`coefficient-${index}`}
                          spellCheck={false}
                          className="cursor-pointer"
                          onClick={() => setIsUpdatingCoef(true)}
                          contentEditable={isUpdatingCoef}
                          onInput={(e) =>
                            setCoefToUpdate(parseInt(e.target.innerText))
                          }
                          onBlur={() =>
                            handleCoefficientUpdate(
                              enseignement.CodMat,
                              enseignement.Coef
                            )
                          }
                        >
                          <span spellCheck={false}>{enseignement.Coef}</span>
                          <Tooltip anchorSelect={`#coefficient-${index}`}>
                            {!isUpdatingCoef
                              ? "Double cliquer pour modifier"
                              : "Saisir la nouvelle valeur"}
                          </Tooltip>
                        </TableCell>
                        <TableCell className="">
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              title="Supprimer le cours"
                              className="cursor-pointer"
                              onClick={() => handleDelete(enseignement)}
                            >
                              <Delete className="h-2 w-4 mr-1" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Modal isOpen={openModal} onClose={closeModal} title="Nouveaux cours">
        <form onSubmit={handleSubmit} className="space-y-6">
          {newEnseignements.map((ens, index) => (
            <div
              key={ens.key}
              className="flex items-end gap-4 p-4 border rounded-md"
            >
              <div className="flex-1 space-y-2">
                <div>
                  <FormLabel>Matiere</FormLabel>
                  <select
                    name="CodMat"
                    onChange={(e) =>
                      handleNewEnseignementChange(
                        ens.key,
                        "CodMat",
                        e.target.value
                      )
                    }
                    value={ens.CodMat}
                    className="h-10 p-2 mt-1 block w-full rounded-md border-[2px] border-gray-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choisir la matiere</option>
                    {matieres.map((matiere) => (
                      <option key={matiere.CodMat} value={matiere.CodMat}>
                        {matiere.NomMat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FormLabel>Coefficient</FormLabel>
                  <input
                    type="number"
                    min="1"
                    value={ens.Coef}
                    name="Coef"
                    onChange={(e) =>
                      handleNewEnseignementChange(
                        ens.key,
                        "Coef",
                        e.target.value
                      )
                    }
                    className="mt-1 block h-10 p-2 w-full rounded-md border-[2px] border-gray-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <FormLabel>Professeur</FormLabel>
                  <select
                    name="NumProf"
                    value={ens.NumProf}
                    onChange={(e) =>
                      handleNewEnseignementChange(
                        ens.key,
                        "NumProf",
                        e.target.value
                      )
                    }
                    className="h-10 p-2 mt-1 block w-full rounded-md border-[2px] border-gray-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Attribuer un professeur</option>
                    {professeursByMatiere[ens.key]?.length === 0 ? (
                      <option value="" disabled>
                        Aucun professeur disponible pour cette matiere
                      </option>
                    ) : (
                      professeursByMatiere[ens.key]?.map((prof) =>
                        prof.NumProf ? (
                          <option key={prof.NumProf} value={prof.NumProf}>
                            {`${prof.NomProf} ${prof.PrenomsProf}`}
                          </option>
                        ) : null
                      )
                    )}
                  </select>
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeNewEnseignement(ens.key)}
              >
                <Delete className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" onClick={addNewEnseignement} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter une matière
          </Button>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 focus:ring-0 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={newEnseignements.length === 0}
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

function FormLabel({ children }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {children}
    </label>
  );
}

export default ClasseConfiguration;
