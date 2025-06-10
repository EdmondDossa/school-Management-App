import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Modal } from "../../components";
import { DuplicateIcon } from "../../assets/icons/index.jsx";
import { SettingsIcon, Delete, Edit } from "lucide-react";
import { Button } from "../../components/Bouton.jsx";
import ButtonBack from "../../components/ButtonBack.jsx";

import {
  getEtablissement,
  getAnneeScolaire,
  electronConfirm,
} from "../../utils/";

import {
  EnseignerService,
  ClasseService,
  CoefficientService,
  ProfesseurService,
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

const initialValues = {
  CodMat: "",
  NumProf: "",
  Coef: 1,
};

const ClasseConfiguration = () => {
  const { id: NumClass } = useParams();

  const [InfoScolaire, setInfoScolaire] = useState({
    NumEtabli: "",
    Annee: "",
  });
  const ref = useRef();

  const [isLoading, setLoading] = useState(true);
  const [isLoadingComponentData, setLoadingComponentData] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [isUpdatingCoef, setIsUpdatingCoef] = useState(false);
  const [coefToUpdate, setCoefToUpdate] = useState(null);

  const [matieres, setMatieres] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [classe, setClasse] = useState({});
  const [enseignements, setEnseignements] = useState([]);
  const [cours, setCours] = useState(initialValues);

  async function fetchInfoScolaire() {
    const { NumEtabli } = await getEtablissement();
    const { Annee } = await getAnneeScolaire();
    setInfoScolaire({ NumEtabli, Annee });
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setCours({ ...cours, [name]: value });
  }

  async function closeModal() {
    setOpenModal(false);
    setProfesseurs([]);
    setCours(initialValues);

    if (cours.id) {
      await fetchMatieresNonAssignee();
    }
  }

  async function fetchMatieresNonAssignee() {
    const matieresNonAssignees =
      await EnseignerService.getMatieresNonEncoreAssigneeAClasse(
        InfoScolaire.Annee,
        NumClass
      );
    setMatieres(matieresNonAssignees);
  }

  async function fetchCurrentClasse() {
    const result = await ClasseService.getClasseByNumClass(NumClass);
    setClasse(result);
  }

  async function fetchEnseignements() {
    const result = await EnseignerService.getEnseignements(
      InfoScolaire.Annee,
      NumClass
    );
    setEnseignements(result);
  }

  async function loadData() {
    setLoadingComponentData(true);
    await fetchCurrentClasse();
    await fetchMatieresNonAssignee();
    await fetchEnseignements();
    setLoadingComponentData(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const enseignement = {
        ...cours,
        NumEtabli: InfoScolaire.NumEtabli,
        Annee: InfoScolaire.Annee,
        NumClass,
      };
      const coefficient = {
        CodMat: cours.CodMat,
        Coef: cours.Coef,
        NumClass,
        Annee: InfoScolaire.Annee,
        NumEtabli: InfoScolaire.NumEtabli,
      };

      if (!cours.id) {
        await EnseignerService.createEnseignement(enseignement);
        await CoefficientService.createCoefficient(coefficient);
        toast.success("Le cours a bien été ajoutee");
      } else {
        await EnseignerService.updateEnseignement(enseignement);
        await CoefficientService.deleteCoefficient(
          cours.CodMat,
          InfoScolaire.Annee,
          NumClass
        );
        await CoefficientService.createCoefficient(coefficient);
        toast.success("Cours modifiee avec success");
      }

      await fetchMatieresNonAssignee();
      await fetchEnseignements();
      closeModal();
    } catch (error) {
      toast.error("Une erreur est survenue.");
    }
  }

  async function handleDelete(enseignement) {
    const confirmDelete = await electronConfirm(
      "Etes vous sûr(e) de vouloir supprimer ce cours ?"
    );
    if (confirmDelete) {
      try {
        await EnseignerService.deleteEnseignement(enseignement.id);
        //remove the related coeff
        await CoefficientService.deleteCoefficient(
          enseignement.CodMat,
          InfoScolaire.Annee,
          NumClass
        );

        await fetchMatieresNonAssignee();
        await fetchEnseignements();
        setCours(initialValues);

        toast.success("Enseignement supprimer avec succes");
      } catch (error) {
        console.log(error);
        toast.error("Une erreur est survenue lors de la suppression");
      }
    }
  }

  async function handleEdit(id) {
    setOpenModal(true);
    const cours = enseignements.find((enseignement) => enseignement.id === id);
    cours.id = id;
    setCours(cours);
    //by default the list of matieres do not include the matiere to edit
    //so we add it to the list of matieres to simulate the default behaviour
    setMatieres([
      ...matieres,
      {
        CodMat: cours.CodMat,
        NomMat: cours.NomMat,
      },
    ]);
  }

  async function handleCoefficientUpdate(CodMat, oldCoef) {
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
  }

  async function filterProfesseurByMatiere() {
    const profs = await ProfesseurService.getProfesseurByCodMat(cours.CodMat);
    setProfesseurs(profs);
  }

  useEffect(() => {
    fetchInfoScolaire();
  }, []);

  useEffect(() => {
    if (!isLoading) loadData();
  }, [isLoading]);

  useEffect(() => {
    if (cours.CodMat) filterProfesseurByMatiere();
  }, [cours.CodMat]);

  if (isLoadingComponentData) return <div>Chargement ...</div>;

  return (
    <>
      <div>
        <div>
          <ButtonBack />
        </div>
        <main className='container mx-auto py-8'>
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center gap-4'>
              <SettingsIcon className='h-8 w-8 text-primary' />
              <h1 className='text-3xl font-bold'>
                Configurer la classe de {classe.NomClass}{" "}
              </h1>
            </div>
            <Button onClick={() => setOpenModal(true)}>
              <img src={DuplicateIcon} className='mr-2 h-4 w-4' />
              Ajouter un cours
            </Button>
          </div>
          <div className='grid gap-6'>
            <Card className='m-auto min-w-[800px]'>
              <CardHeader>
                <CardTitle>Liste des cours</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {tableHeadFields.map((field) => (
                        <TableHead className='text-center' key={field}>
                          {" "}
                          {field}{" "}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  {enseignements.length > 0 && (
                    <TableBody>
                      {enseignements.map((enseignement, index) => (
                        <TableRow key={index}>
                          <TableCell> {enseignement.NomMat} </TableCell>
                          <TableCell>
                            {" "}
                            {`${enseignement.NomProf} ${enseignement.PrenomsProf}`}{" "}
                          </TableCell>

                          <TableCell
                            id='coefficient'
                            spellCheck={false}
                            className='cursor-pointer'
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
                            <span ref={ref} spellCheck={false}>
                              {enseignement.Coef}
                            </span>
                            <span contentEditable={false}>
                              <Tooltip anchorSelect='#coefficient'>
                                {!isUpdatingCoef
                                  ? "Double cliquer pour modifier"
                                  : "Saisir la nouvelle valeur"}
                              </Tooltip>
                            </span>
                          </TableCell>

                          <TableCell className=''>
                            <div className='flex gap-2'>
                              <Button
                                variant='destructive'
                                size='sm'
                                title='Supprimer le cours'
                                className='cursor-pointer'
                                onClick={() => handleDelete(enseignement)}
                              >
                                <Delete className='h-2 w-4 mr-1' />
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                className='px-3'
                                title='Modifier les informations'
                                onClick={() => handleEdit(enseignement.id)}
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                </Table>
                {enseignements.length === 0 && (
                  <div>
                    <p className='text-gray-400 text-md text-center p-10'>
                      {" "}
                      Aucun cours enregistre pour le moment{" "}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Modal
        isOpen={openModal}
        onClose={closeModal}
        title={cours.id ? "Modification du cours" : "Nouveau cours"}
      >
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <FormLabel>Matieres</FormLabel>
            <select
              name='CodMat'
              id='Matieres'
              onChange={handleChange}
              defaultValue={cours.CodMat}
              className='h-10 p-2 mt-1 block w-full rounded-md border-[2px] border-gray-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500'
              required
            >
              <option value=''>Choisir la matiere</option>
              {matieres.map((matiere) => (
                <option key={matiere.CodMat} value={matiere.CodMat}>
                  {matiere.NomMat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FormLabel>Définir le coefficient</FormLabel>
            <input
              type='number'
              min='1'
              value={cours.Coef}
              name='Coef'
              onChange={handleChange}
              className='mt-1 block h-10 p-2 w-full rounded-md border-[2px] border-gray-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500'
            />
          </div>
          <div>
            <FormLabel>Professeur</FormLabel>
            <select
              name='NumProf'
              id='Professeur'
              value={cours.NumProf}
              onChange={handleChange}
              className='h-10 p-2 mt-1 block w-full rounded-md border-[2px] border-gray-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500'
              required
            >
              <option value=''>Attribuer un professeur</option>
              {professeurs?.length === 0 ? (
                <option value='' disabled>
                  Aucun professeur disponible pour cette matiere
                </option>
              ) : (
                professeurs?.map((prof) =>
                  prof.NumProf ? (
                    <option key={prof.NumProf} value={prof.NumProf}>
                      {`${prof.NomProf} ${prof.PrenomsProf}`}
                    </option>
                  ) : (
                    <option value='' disabled>
                      Aucun professeur disponible pour cette matiere
                    </option>
                  )
                )
              )}
            </select>
          </div>

          <div className='flex justify-end'>
            <button
              type='submit'
              className='px-4 py-2 focus:ring-0 bg-blue-600 text-white rounded-md hover:bg-blue-700'
            >
              {cours.id ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

function FormLabel({ children }) {
  return (
    <label
      htmlFor={children}
      className='block text-sm font-medium text-gray-700'
    >
      {children}
    </label>
  );
}

export default ClasseConfiguration;
