import React, { useState, useEffect } from "react";
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
import { Check, Edit, Eye, Info, Search, Delete } from "lucide-react";
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

  //to handle students research in the search box
  const [searchEleve, setSearchEleve] = useState("");
  const optimizedSearchEleve = useDebounce(searchEleve, 500);
  const [formFields, setFormFields] = useState(eleveFields);

  async function fetchPaginatedEleves(currentPage = 1) {
    const result = await EleveService.getPaginatedEleves(
      currentPage,
      MAX_ELEVE_BY_PAGE
    );
    console.log(result);

    setEleves(result.eleves);
    setPagination({ currentPage: result.currentPage, total: result.total });
  }

  async function fetchEleves() {
    setLoading(true);
    await fetchPaginatedEleves();
    setLoading(false);
  }

  async function fetchAppData() {
    await fetchEleves();
    const { Annee } = await getAnneeScolaire();
    setAnneeEnCours(Annee);
  }

  async function fetchEleveForSearch() {
    const result = await EleveService.searchEleve(optimizedSearchEleve);
    if (result.success) setEleves(result.data);
    else toast.error("Une erreur est survenue pendant la recherche");
  }

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
          await fetchEleves();
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

  const handleSearchBoxChange = (e) => setSearchEleve(e.target.value);

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
      await fetchEleves();
    } catch (error) {
      console.log(error);
      toast.error("Une erreur est survenue lors de la modification");
    } finally {
      if (result.success) toast.success("Modification effectuée");
      else toast.error("Une erreur est survenue");
      handleFormModalClose();
    }
  }

  useEffect(() => {
    fetchAppData();
  }, []);

  useEffect(() => {
    if (optimizedSearchEleve) {
      fetchEleveForSearch(optimizedSearchEleve);
    }
  }, [optimizedSearchEleve]);

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
        <div className="flex items-center content-center space-x-2 ">
          <span>
            {" "}
            <Search className="translate-x-[34px]" />{" "}
          </span>
          <Input
            type="search"
            className="ps-8"
            value={searchEleve}
            placeholder="Rechercher un eleve..."
            onChange={handleSearchBoxChange}
          />
        </div>
      </div>
      <main className="container pt-8">
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
          <Card className="m-auto min-w-[800px]">
            <CardHeader className="sticky -top-5 z-20 opacity-100 bg-white">
              <CardTitle>Liste des Élèves</CardTitle>
              <CardDescription>Gérez les élèves</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="sticky top-0">
                  <TableRow>
                    {tableHeadFields.map((field) => (
                      <TableHead key={field}> {field} </TableHead>
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
                        {optimizedSearchEleve
                          ? `Aucun élève correspondant au terme <${optimizedSearchEleve}>`
                          : "Aucun élève enregistré pour le moment"}
                      </TableCell>
                    </TableRow>
                  )}
                  {eleves?.map((eleve, index) => (
                    <TableRow key={eleve.Matricule}>
                      <TableCell>
                        {index +
                          1 +
                          (pagination.currentPage - 1) * MAX_ELEVE_BY_PAGE}
                      </TableCell>
                      <TableCell>{eleve.Matricule}</TableCell>
                      <TableCell>{eleve.Nom}</TableCell>
                      <TableCell className="truncate">
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
