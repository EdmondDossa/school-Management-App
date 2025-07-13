import React, { useState, useEffect, useCallback } from "react";
import EleveService from "../../../services/EleveService";
import { toast } from "react-hot-toast";
import { Button } from "../../components/Bouton.jsx";
import { Link } from "react-router-dom";
import useDebounce from "../../hooks/use-debounce.js";
import Input from "../../components/Input.jsx";
import { Users } from "lucide-react";
import Modal from "../../components/Modal.jsx";
import Form from "../../components/Form.jsx";
import { electronConfirm, getAnneeScolaire } from "../../utils/";
import { eleveFields, eleveMatriculeField } from "../../utils/form-fields.js";
import InscriptionService from "../../../services/InscriptionService.js";
import { FaCirclePlus } from "react-icons/fa6";
import { Tooltip } from "react-tooltip";
import { Check, Edit, Eye, Info, Search, Delete, X } from "lucide-react";
import Pagination from "../../components/Pagination.jsx";
import { DuplicateIcon } from "../../assets/icons/index.jsx";

import {
  Card,
  CardContent,
  CardDescription,
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

const tableHeadFields = ["Numéro", "Matricule", "Nom", "Prenoms", "Actions"];

const ElevesList = () => {
  const [eleves, setEleves] = useState([]);
  const [pagination, setPagination] = useState({});
  const MAX_ELEVE_BY_PAGE = 20;
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const initialValues = {
    Matricule: "",
    Sexe: "M",
    Nom: "",
    Prenoms: "",
    ContactParent: "",
  };
  const [eleve, setEleve] = useState(initialValues);
  const [anneeEnCours, setAnneeEnCours] = useState("");

  const [openFormModal, setOpenFormModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openEleveInfoModal, setOpenEleveInfoModal] = useState(false);

  // États pour la recherche optimisée
  const [searchEleve, setSearchEleve] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const optimizedSearchEleve = useDebounce(searchEleve, 500);
  const [formFields, setFormFields] = useState(eleveFields);

  // Fonction pour récupérer les élèves paginés
  const fetchPaginatedEleves = useCallback(
    async (currentPage = 1) => {
      try {
        const result = await EleveService.getPaginatedEleves(
          currentPage,
          MAX_ELEVE_BY_PAGE
        );
        console.log(result);

        setEleves(result.eleves);
        setPagination({ currentPage: result.currentPage, total: result.total });
      } catch (error) {
        console.error("Erreur lors de la récupération des élèves:", error);
        toast.error("Erreur lors du chargement des élèves");
      }
    },
    [MAX_ELEVE_BY_PAGE]
  );

  // Fonction pour récupérer tous les élèves
  const fetchEleves = useCallback(async () => {
    setLoading(true);
    await fetchPaginatedEleves();
    setLoading(false);
  }, [fetchPaginatedEleves]);

  // Fonction pour récupérer les données de l'application
  const fetchAppData = useCallback(async () => {
    await fetchEleves();
    const { Annee } = await getAnneeScolaire();
    setAnneeEnCours(Annee);
  }, [fetchEleves]);

  // Fonction optimisée pour la recherche
  const fetchEleveForSearch = useCallback(
    async (searchTerm) => {
      if (!searchTerm || searchTerm.trim() === "") {
        // Si le terme de recherche est vide, revenir à la liste paginée
        setIsSearchMode(false);
        await fetchPaginatedEleves(1);
        return;
      }

      setSearchLoading(true);
      setIsSearchMode(true);

      try {
        const result = await EleveService.searchEleve(searchTerm);
        if (result.success) {
          setEleves(result.data);
          // Réinitialiser la pagination en mode recherche
          setPagination({ currentPage: 1, total: result.data.length });
        } else {
          toast.error("Une erreur est survenue pendant la recherche");
        }
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        toast.error("Une erreur est survenue pendant la recherche");
      } finally {
        setSearchLoading(false);
      }
    },
    [fetchPaginatedEleves]
  );

  // Fonction pour vider la recherche
  const clearSearch = useCallback(() => {
    setSearchEleve("");
    setIsSearchMode(false);
    fetchPaginatedEleves(1);
  }, [fetchPaginatedEleves]);

  // Gestionnaire optimisé pour le changement de la recherche
  const handleSearchBoxChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchEleve(value);

      // Si l'utilisateur vide le champ, réinitialiser immédiatement
      if (value === "") {
        setIsSearchMode(false);
        fetchPaginatedEleves(1);
      }
    },
    [fetchPaginatedEleves]
  );

  function handleEdit(matricule) {
    EleveService.getEleveByMatricule(matricule).then((result) => {
      if (result != null) {
        setEleve(result);
        setOpenFormModal(true);
      } else {
        toast.error("Erreur lors de la modification");
      }
    });
  }

  async function handleDelete(matricule) {
    let result = null;
    const confirmDelete = await electronConfirm(
      "Êtes-vous sûr de vouloir supprimer cet élève ?"
    );
    if (confirmDelete) {
      try {
        result = await EleveService.deleteEleve(matricule);
      } catch (error) {
        console.log(error);
        toast.error("Une erreur est survenue lors de la suppression.");
      } finally {
        if (result.success) {
          //on le supprime de la table des inscriptions également
          await InscriptionService.deleteInscriptionByMatricule(
            matricule,
            anneeEnCours
          );
          // Actualiser la liste selon le mode actuel
          if (isSearchMode && searchEleve) {
            await fetchEleveForSearch(searchEleve);
          } else {
            await fetchEleves();
          }
        } else {
          toast.error("Une erreur est survenue lors de la suppression.");
        }
      }
    }
  }

  async function displayEleve(Matricule) {
    const eleve = await EleveService.getEleveByMatricule(Matricule);
    const details = await InscriptionService.getElevesInformations(
      Matricule,
      anneeEnCours
    );
    setEleve({ ...eleve, ...details });
    setOpenEleveInfoModal(true);
  }

  function handleFormModalClose() {
    setOpenFormModal(false);
    setEleve(initialValues);
  }

  async function handleSubmit(eleve) {
    let result;
    try {
      if (formFields[0].name !== "Matricule") {
        result = await EleveService.updateEleve(eleve);
      } else {
        result = await EleveService.createEleve(eleve);
      }

      // Actualiser la liste selon le mode actuel
      if (isSearchMode && searchEleve) {
        await fetchEleveForSearch(searchEleve);
      } else {
        await fetchEleves();
      }
    } catch (error) {
      console.log(error);
      toast.error("Une erreur est survenue lors de la modification");
    } finally {
      if (result.success) toast.success("Modification effectuée");
      else toast.error("Une erreur est survenue");
      handleFormModalClose();
    }
  }

  // Gestionnaire pour la pagination
  const handlePageChange = useCallback(
    (page) => {
      if (!isSearchMode) {
        fetchPaginatedEleves(page);
      }
    },
    [isSearchMode, fetchPaginatedEleves]
  );

  useEffect(() => {
    fetchAppData();
  }, [fetchAppData]);

  // Effet pour la recherche optimisée
  useEffect(() => {
    if (optimizedSearchEleve !== undefined) {
      fetchEleveForSearch(optimizedSearchEleve);
    }
  }, [optimizedSearchEleve, fetchEleveForSearch]);

  useEffect(() => {
    //si il s'agit d'une édition d'eleves le champ matricule ne s'affiche pas.
    //sinon il s'affiche pour qu'on puisse lui en attribuer un
    if (!eleve.Matricule) setFormFields([eleveMatriculeField, ...eleveFields]);
    else setFormFields(eleveFields);
  }, [eleve.Matricule]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <section>
      <div className="flex flex-wrap justify-between content-center gap-3 items-center">
        <div className="flex items-center content-center space-x-2 relative w-[300px]">
          <Input
            type="search"
            className="px-[30px]"
            value={searchEleve}
            placeholder="Rechercher un eleve..."
            onChange={handleSearchBoxChange}
          />
          <Search className="absolute right-[10px] top-1/2 transform -translate-y-1/2" />
        </div>
      </div>
      <main className="pt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Gestion des Élèves</h1>
          </div>
          <div className="flex items-center">
            <div className="place-content-center">
              <Info
                className="text-emerald-600 cursor-pointer w-6 h-6"
                onClick={() => setOpenInfoModal(true)}
              />
            </div>
            <div className="ms-4">
              <Button onClick={() => setOpenFormModal(true)}>
                <img src={DuplicateIcon} className="mr-2 h-4 w-4" />
                Ajouter un élève
              </Button>
            </div>
          </div>
        </div>
        <div className="grid gap-6 relative">
          <Card className="m-auto w-full">
            <CardHeader className="sticky -top-5 z-20 opacity-100 bg-white">
              <CardTitle>Liste des Élèves</CardTitle>
              <CardDescription>
                Gérez les élèves
                {isSearchMode && ` - ${eleves.length} résultat(s) trouvé(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="sticky top-0">
                  <TableRow>
                    {tableHeadFields.map((field) => (
                      <TableHead key={field} className={"text-start"}>
                        {" "}
                        {field}{" "}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eleves.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-gray-400 text-md text-center"
                      >
                        {searchEleve
                          ? `Aucun élève correspondant au terme "${searchEleve}"`
                          : "Aucun élève enregistré pour le moment"}
                      </TableCell>
                    </TableRow>
                  )}
                  {eleves?.map((eleve, index) => (
                    <TableRow key={eleve.Matricule}>
                      <TableCell className={"text-start"}>
                        {isSearchMode
                          ? index + 1
                          : index +
                            1 +
                            (pagination.currentPage - 1) * MAX_ELEVE_BY_PAGE}
                      </TableCell>
                      <TableCell className={"text-start"}>
                        {eleve.Matricule}
                      </TableCell>
                      <TableCell className={"text-start"}>
                        {eleve.Nom}
                      </TableCell>
                      <TableCell className="truncate text-start">
                        {eleve.Prenoms.length < 25
                          ? eleve.Prenoms
                          : eleve.Prenoms.slice(0, 22) + " ..."}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            className="px-3 border-[1px] border-blue-500"
                            size="sm"
                            variant="outline"
                            onClick={() => displayEleve(eleve.Matricule)}
                            title="Voir plus d'informations"
                          >
                            <Eye className="h-4 w-4 text-blue-700" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-3"
                            title="Modifier les informations"
                            onClick={() => handleEdit(eleve.Matricule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="ps-3 pe-4"
                            title="Supprimer"
                            onClick={() => handleDelete(eleve.Matricule)}
                          >
                            <Delete className="h-4 w-4" />
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

        {/* Afficher la pagination seulement en mode normal */}
        {!isSearchMode && pagination.total > MAX_ELEVE_BY_PAGE && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={Math.ceil(pagination.total / MAX_ELEVE_BY_PAGE)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>

      {/* Modal for informations */}
      <Modal
        isOpen={openInfoModal}
        onClose={() => setOpenInfoModal(false)}
        title="Informations"
      >
        <div className="flex items-center  text-gray-500">
          <span>
            <Check className="w-10 h-10" />
          </span>
          <p>
            Pour les opérations de modification ou de suppresion ,assurez-vous
            de les faire aussi sur EDUCMASTER car toute opération effectuée ici
            ne sera pas pris en compte directement.
          </p>
        </div>

        <div className="flex items-center mt-5 text-gray-500">
          <div>
            <Check className="w-10 h-10" />
          </div>
          <p>
            Pour les opérations d'ajout, rendez-vous dans la section{" "}
            <Link to="/classes" className=" text-blue-500 font-bold">
              {" "}
              Classes{" "}
            </Link>{" "}
            puis accéder à une classe pour importer les élèves depuis le fichier
            pdf obtenu depuis EDUCMASTER, ou ajouter l'élève ici puis aller
            l'ajouter manuellement dans sa classe
          </p>
        </div>
      </Modal>

      {/* Modal for editing/submiting eleves informations */}
      <Modal
        isOpen={openFormModal}
        onClose={() => handleFormModalClose()}
        title={
          eleve.Matricule
            ? "Modifier les informations de l'élève"
            : "Ajouter un élève"
        }
      >
        <Form
          fields={formFields}
          onSubmit={handleSubmit}
          initialValues={eleve}
          submitLabel={eleve.Matricule ? "Modifier" : "Ajouter"}
        />
      </Modal>

      {/* Modal to display more information about a student */}
      <Modal
        isOpen={openEleveInfoModal}
        onClose={() => setOpenEleveInfoModal(false)}
        title="Informations supplémentaires"
      >
        <Table>
          <TableBody>
            {eleveFields.map((field, index) => {
              return (
                <TableRow key={index}>
                  <TableHead> {field.label} </TableHead>
                  <TableCell> {eleve[field.name] || "---"} </TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableHead> Classe </TableHead>
              <TableCell> {eleve.NomClass || "---"} </TableCell>
            </TableRow>
            <TableRow>
              <TableHead> Statut </TableHead>
              <TableCell> {eleve.Statut || "---"} </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Modal>
    </section>
  );
};

export default ElevesList;
