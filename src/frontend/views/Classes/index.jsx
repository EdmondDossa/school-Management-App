import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import ClasseService from "../../../services/ClasseService.js";
import { Modal, Form } from "../../components";
import { DuplicateIcon } from "../../assets/icons/index.jsx";
import AnneeScolaireService from "../../../services/AnneeScolaireService.js";
import {
  BookOpen,
  Edit,
  Users,
  Delete,
  EllipsisVertical,
  Milestone,
} from "lucide-react";
import { Button } from "../../components/Bouton.jsx";
import { useNavigate } from "react-router-dom";
import ExtractElevesButton from "../../components/ExtractElevesButton.jsx";

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
import { Tooltip } from "react-tooltip";
import EleveService from "../../../services/EleveService.js";
import InscriptionService from "../../../services/InscriptionService.js";
import { getAnneeScolaire } from "../../utils/index.js";

const classFields = [
  { name: "NomClass", label: "Nom de la Classe", type: "text" },
  {
    name: "Promotion",
    label: "Promotion de la classe",
    type: "select",
    options: [
      { label: "6 ème", value: "6" },
      { label: "5 ème", value: "5" },
      { label: "4 ème", value: "4" },
      { label: "3 ème", value: "3" },
      { label: "2 sd", value: "2" },
      { label: "1 ere", value: "1" },
      { label: "Terminale", value: "tle" },
    ],
  },
];

const ClassesList = () => {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [classe, setClasse] = useState({
    NumClass: null,
    NomClass: "",
    Promotion: "6",
  });

  const [anneesScolaires, setAnneesScolaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const fetchClasses = async () => {
    try {
      setClasse({ ...classe });
      const result = await ClasseService.getAllClasses();
      setClasses(result);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAnneesScolaires = async () => {
    const result = await AnneeScolaireService.getAllAnneesScolaires();
    setAnneesScolaires(result);
  };

  const handleDelete = async (id) => {
    const confirmDeletion = await window.electronAPI.confirm(
      "Êtes-vous sûr de vouloir supprimer cette classe ?"
    );
    if (confirmDeletion) {
      try {
        const result = await ClasseService.deleteClasse(id);
        if (result.success) {
          toast.success("Classe supprimé avec succès");
          await fetchClasses();
        } else {
          toast.error("Erreur lors de la suppression");
        }
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleEdit = (id) => {
    setOpenModal(true);
    ClasseService.getClasseByNumClass(id).then((result) => {
      if (result != null) {
        setClasse(result);
      } else {
        toast.error("Erreur lors de la modification");
      }
    });
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setClasse({ ...classe, NomClass: "", NumClass: "" });
  };
  const handleSubmit = async (formData) => {
    try {
      let result;
      if (!formData.NumClass) {
        result = await ClasseService.createClasse(formData);
      } else {
        result = await ClasseService.updateClasse(formData);
      }

      if (result.success) {
        toast.success(
          formData.NumClass
            ? "Classe modifiée avec succès"
            : "Classe ajoutée avec succès"
        );
        handleModalClose();
        await fetchClasses();
      } else {
        toast.error("Une erreur est survenue");
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue " + error);
    }
  };

  const handleExtraction = async (eleves, numclass) => {
    console.log(numclass, eleves);

    try {
      //on enrégistre les élèves s'ils n'existaient pas
      let result = await EleveService.insertManyEleves(eleves);
      if (result.success) {
        toast.success(
          `Import de ${result.data.changes} / ${eleves.length} élèves de la liste
          `,
          { duration: 5000 }
        );
        //on fait l'inscription des élèves dans la classe
        const lastInsertedMatricules = eleves.map((e) => e.Matricule);
        const { Annee } = await getAnneeScolaire();

        result = await InscriptionService.insertManyInClass(
          lastInsertedMatricules,
          numclass,
          Annee
        );
      }
      if (result.success) {
        toast.success(`${result.data.changes} nouvelles inscriptions`, {
          duration: 5000,
        });
      } else toast.error("Une erreur est survenue lors de l'import");
    } catch (error) {
      console.log(err);
      toast.error("Une erreur est survenue lors de l'import");
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchAllAnneesScolaires();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <div>
        <main className="container pt-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Gestion des Classes</h1>
            </div>
            <Button onClick={() => setOpenModal(true)}>
              <img src={DuplicateIcon} className="mr-2 h-4 w-4" />
              Ajouter une classe
            </Button>
          </div>

          <div className="grid gap-6">
            <Card className="m-auto min-w-[800px]">
              <CardHeader>
                <CardTitle>Liste des Classes</CardTitle>
                <CardDescription>
                  Gérez les classes, les matières et les affectations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom de la classe</TableHead>
                      <TableHead>Promotion</TableHead>
                      <TableHead>Nombre d'élèves</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-gray-400 text-md text-center p-10"
                        >
                          {" "}
                          Aucune classe enregistrée pour le moment{" "}
                        </TableCell>
                      </TableRow>
                    )}
                    {classes.map((classe, index) => (
                      <TableRow key={classe.NumClass}>
                        <TableCell>{classe.NomClass}</TableCell>
                        <TableCell>{classe.Promotion}</TableCell>
                        <TableCell>0</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <div>
                              <Button
                                variant="outline"
                                id={`matieres-${index}`}
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/classes/config-class/${classe.NumClass}`
                                  )
                                }
                              >
                                <BookOpen className="h-4 w-4" />
                              </Button>
                              <Tooltip
                                className="opacity-100"
                                anchorSelect={`#matieres-${index}`}
                                content="Affecter les matières aux classes"
                              />
                            </div>
                            <div>
                              <Button
                                variant="outline"
                                className="px-3"
                                id={`editer-${index}`}
                                size="sm"
                                onClick={() => handleEdit(classe.NumClass)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Tooltip
                                className="opacity-100"
                                anchorSelect={`#editer-${index}`}
                                content="Modifier les informations"
                              />
                            </div>
                            <div id={`more-${index}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                id="more"
                                title="Plus d'options"
                              >
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                            </div>
                            <div>
                              <Tooltip
                                anchorSelect={`#more-${index}`}
                                clickable
                                className="w-[190px] opacity-100 card shadow-lg px-0  gap-2 bg-white z-20 "
                                openOnClick
                                place="right-left"
                                noArrow
                                delayHide={0}
                                positionStrategy="fixed"
                              >
                                <div>
                                  <h2 className="text-gray-500 text-[16px] mb-3 ">
                                    Options
                                  </h2>
                                </div>
                                <hr />
                                <div className="my-2">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="mb-2 hover:text-white hover:bg-red-500 py-4"
                                    onClick={() =>
                                      handleDelete(classe.NumClass)
                                    }
                                  >
                                    <Delete className="h-4 w-4 mr-2 text-red-800" />
                                    Supprimer classe
                                  </Button>
                                </div>
                                <div className="mt-2">
                                  <hr />
                                  <ExtractElevesButton
                                    className="mt-2 hover:text-white hover:bg-emerald-600"
                                    buttonText="Importer les élèves "
                                    onExtract={(eleves) =>
                                      handleExtraction(eleves, classe.NumClass)
                                    }
                                    onError={(err) => toast.error(err.message)}
                                  />
                                </div>
                              </Tooltip>
                            </div>
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
      <Modal
        isOpen={openModal}
        onClose={handleModalClose}
        title="Ajouter une classe"
      >
        <Form
          fields={classFields}
          onSubmit={handleSubmit}
          initialValues={classe}
          submitLabel={classe.NumClass ? "Modifier" : "Ajouter"}
        />
      </Modal>
    </>
  );
};

export default ClassesList;
