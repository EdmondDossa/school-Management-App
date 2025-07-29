import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Modal, Form } from "../../components";
import { Button } from "../../components/Bouton.jsx";
import { DuplicateIcon } from "../../assets/icons/index.jsx";
import { BookOpen, Delete, Edit, Eye } from "lucide-react";
import { professeurFields } from "../../utils/form-fields.js";

import {
  ProfesseurService,
  MatiereService,
  profMatieresService,
  EnseignerService,
} from "../../../services/";

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

import { capitalize, electronConfirm, getAnneeScolaire } from "../../utils/";

const Professeur = () => {
  const [Professeurs, setProfesseurs] = useState([]);

  const tableHeadFields = ["Nom", "Sexe", "Matiere", "Actions"];

  const initialValues = {
    NumProf: "",
    NomProf: "",
    PrenomsProf: "",
    Sexe: "M",
    CodMat: "",
    Email: "",
    Adresse: "",
    Telephone: "",
    DateNaissance: "",
    LieuNaissance: "",
    Nationalite: "",
    matieres: [],
  };

  const [professeur, setProfesseur] = useState(initialValues);
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openProfInfoModal, setOpenProfInfoModal] = useState(false);

  const fetchProfesseurs = async () => {
    try {
      setProfesseur({ ...professeur });
      let results = await ProfesseurService.getAllProfesseurs();
      setProfesseurs(results);
    } catch (error) {
      toast.error("Erreur lors du chargement des professeurs");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatieres = async () => {
    const result = await MatiereService.getAllMatieres();
    setMatieres(result);
  };

  const handleModalClose = () => {
    setOpenEditModal(false);
    setOpenProfInfoModal(false);
    setProfesseur({
      ...initialValues,
    });
  };

  const handleSubmit = async (professeur) => {
    //formater le nom et le prenom definitivement
    professeur.NomProf = professeur.NomProf.toUpperCase();
    professeur.PrenomsProf = capitalize(professeur.PrenomsProf);
    try {
      let result;
      if (!professeur.NumProf) {
        //creation du professeur
        result = await ProfesseurService.createProfesseur(professeur);
      } else {
        result = await ProfesseurService.updateProfesseur(professeur);
      }

      if (result.success) {
        //associer les matieres aux professeurs
        if (!professeur.NumProf) {
          //on a besoin de l'id du dernier prof inscrit afin de l'enregitrer dans la table profmatieres
          const lastProfInserted =
            await ProfesseurService.getLastInsertedProf();
          await profMatieresService.defineMatieresForProf(
            lastProfInserted.NumProf,
            professeur.matieres ?? []
          );
        } else {
          await profMatieresService.defineMatieresForProf(
            professeur.NumProf,
            professeur.matieres ?? []
          );
        }
        toast.success(
          professeur.NumProf
            ? "Professeur modifiée avec succès"
            : "Professeur ajoutée avec succès"
        );
        await fetchProfesseurs();
      } else {
        toast.error("Une erreur est survenue");
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue " + error);
    } finally {
      handleModalClose();
    }
  };

  const handleDelete = async (id) => {
    const confirmDeletion = await electronConfirm(
      "Êtes-vous sûr de vouloir supprimer ce professeur?"
    );
    if (confirmDeletion) {
      try {
        const result = await ProfesseurService.deleteProfesseur(id);
        //supprimer le cours enseigner par ce professeur
        const { Annee } = await getAnneeScolaire();

        if (result.success) {
          //supprimer les matieres associes à ce professeur
          await profMatieresService.deleteRecordByProf(id);
          toast.success("Professeur supprimé avec succès");
          await fetchProfesseurs();
          //supprimer les cours correspondants
          await EnseignerService.deleteEnseignementByProfesseur(id, Annee);
        } else {
          toast.error("Erreur lors de la suppression");
        }
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleEdit = (id) => {
    ProfesseurService.getProfesseurByNum(id).then((result) => {
      if (result != null) {
        setProfesseur(result);
        setOpenEditModal(true);
      } else {
        toast.error("Erreur lors de la modification");
      }
    });
  };

  const updateProfesseurFields = () => {
    professeurFields[0].options = matieres.map((matiere) => ({
      label: matiere.NomMat,
      value: matiere.CodMat,
    }));
  };

  function displayProf(professeur) {
    setOpenProfInfoModal(true);
    setProfesseur(professeur);
  }

  useEffect(() => {
    fetchProfesseurs();
    fetchMatieres();
  }, []);

  useEffect(() => {
    updateProfesseurFields();
  }, [matieres]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <div>
        <main className="pt-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Gestion des Professeurs</h1>
            </div>
            <Button onClick={() => setOpenEditModal(true)}>
              <img src={DuplicateIcon} className="mr-2 h-4 w-4" />
              Ajouter un professeur
            </Button>
          </div>

          <div className="grid gap-6">
            <Card className="m-auto w-full">
              <CardHeader>
                <CardTitle>Liste des Professeurs</CardTitle>
                <CardDescription>Gérez les professeurs</CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {tableHeadFields.map((field) => (
                        <TableHead key={field}> {field} </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Professeurs.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-gray-400 text-md text-center"
                        >
                          Aucun professeur enregistré pour le moment
                        </TableCell>
                      </TableRow>
                    )}
                    {Professeurs?.map((professeur) => (
                      <TableRow key={professeur.NumProf}>
                        <TableCell>
                          {" "}
                          {`${professeur.NomProf} ${professeur.PrenomsProf} `}{" "}
                        </TableCell>
                        <TableCell> {professeur.Sexe} </TableCell>
                        <TableCell className="max-w-[150px]">
                          {professeur.matieres.length === 0
                            ? "---"
                            : professeur.matieres
                                .map((matiere) => matiere.NomMat)
                                .join(",")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              className="px-3"
                              size="sm"
                              variant="outline"
                              onClick={() => displayProf(professeur)}
                              title="Voir plus d'informations"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-3"
                              title="Modifier les informations"
                              onClick={() => handleEdit(professeur.NumProf)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="ps-3 pe-4"
                              title="Supprimer"
                              onClick={() => handleDelete(professeur.NumProf)}
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
      </div>
      {/* Modal for editing prof informations */}
      <Modal
        isOpen={openEditModal}
        onClose={handleModalClose}
        title={
          professeur.NumProf
            ? "Modifier les informations de l'enseignant"
            : "Ajouter une professeur"
        }
      >
        <Form
          fields={professeurFields}
          onSubmit={handleSubmit}
          initialValues={professeur}
          submitLabel={professeur.NumProf ? "Modifier" : "Ajouter"}
        />
      </Modal>

      {/* Modal to display more information about a professeur */}
      <Modal
        isOpen={openProfInfoModal}
        onClose={handleModalClose}
        title="Informations supplémentaires"
      >
        <Table>
          <TableBody>
            {professeurFields.map((field, index) => {
              //since we don't wanna show the matiere field
              if (field.name !== "matieres") {
                return (
                  <TableRow key={index}>
                    <TableHead> {field.label} </TableHead>
                    <TableCell> {professeur[field.name] || "---"} </TableCell>
                  </TableRow>
                );
              }
            })}
          </TableBody>
        </Table>
      </Modal>
    </>
  );
};

export default Professeur;
