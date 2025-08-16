import React, { useState, useEffect, useCallback } from "react";
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
  Search,
} from "lucide-react";
import { Button } from "../../components/Bouton.jsx";
import { useNavigate } from "react-router-dom";
import ExtractElevesButton from "../../components/ExtractElevesButton.jsx";
import useDebounce from "../../hooks/use-debounce.js";
import Input from "../../components/Input.jsx";

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
import { HiLightBulb } from "react-icons/hi";

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
  { name: "Salle", label: "Salle", type: "text" },
];

const ClassesList = () => {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [searchClasse, setSearchClasse] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const optimizedSearchClasse = useDebounce(searchClasse, 500);
  const [searchLoading, setSearchLoading] = useState(false);
  const [effectifsParClasse, setEffectifsParClasse] = useState({});
  const [classe, setClasse] = useState({
    NumClass: null,
    NomClass: "",
    Promotion: "6",
    Salle: "",
  });

  const [anneesScolaires, setAnneesScolaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const result = await ClasseService.getAllClasses();
      setClasses(result);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des classes");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClasseForSearch = useCallback(
    async (searchTerm) => {
      if (!searchTerm || searchTerm.trim() === "") {
        setIsSearchMode(false);
        await fetchClasses();
        return;
      }

      setSearchLoading(true);
      setIsSearchMode(true);

      try {
        const result = await ClasseService.searchClasse(searchTerm);
        if (result.success) {
          setClasses(result.data);
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
    [fetchClasses]
  );

  const clearSearch = useCallback(() => {
    setSearchClasse("");
    setIsSearchMode(false);
    fetchClasses();
  }, [fetchClasses]);

  const handleSearchBoxChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchClasse(value);

      if (value === "") {
        setIsSearchMode(false);
        fetchClasses();
      }
    },
    [fetchClasses]
  );

  const fetchEffectifsParClasse = async () => {
    const { Annee } = await getAnneeScolaire();
    const result = await InscriptionService.getEffectifsByClasse(Annee);
    setEffectifsParClasse(result);
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
          if (isSearchMode && searchClasse) {
            await fetchClasseForSearch(searchClasse);
          } else {
            await fetchClasses();
          }
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
        if (isSearchMode && searchClasse) {
            await fetchClasseForSearch(searchClasse);
        } else {
            await fetchClasses();
        }
      } else {
        toast.error("Une erreur est survenue");
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue " + error);
    }
  };

  const handleExtraction = async (eleves, numclass) => {
    try {
      const totalAvant = await EleveService.getTotalEleves();
      let result = await EleveService.insertManyEleves(eleves);
      const totalApres = await EleveService.getTotalEleves();
      if (result.success) {
        toast.success(
          `Import de ${+totalApres - +totalAvant} / ${
            eleves.length
          } élèves de la liste
          `,
          { duration: 5000 }
        );

        const lastInsertedMatricules = eleves.map((e) => e.Matricule);
        const { Annee } = await getAnneeScolaire();

        const totalInscritsAvant = await InscriptionService.getTotalInscrits();
        result = await InscriptionService.insertManyInClass(
          lastInsertedMatricules,
          numclass,
          Annee
        );
        const totalInscritsApres = await InscriptionService.getTotalInscrits();

        if (result.success) {
          toast.success(
            `${
              +totalInscritsApres - +totalInscritsAvant
            } nouvelles inscriptions`,
            {
              duration: 5000,
            }
          );
          await fetchEffectifsParClasse();
        } else toast.error("Une erreur est survenue lors de l'import");
      }
    } catch (error) {
      console.log(error);
      toast.error("Une erreur est survenue lors de l'import");
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchAllAnneesScolaires();
    fetchEffectifsParClasse();
  }, [fetchClasses]);

  useEffect(() => {
    if (optimizedSearchClasse !== undefined) {
      fetchClasseForSearch(optimizedSearchClasse);
    }
  }, [optimizedSearchClasse, fetchClasseForSearch]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <div>
        <main className=" pt-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Gestion des Classes</h1>
            </div>
          </div>

          <div className="grid gap-6">
            <Card className="m-auto w-full">
              <CardHeader className="sticky -top-5 z-20 opacity-100 bg-white flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Liste des Classes</CardTitle>
                  <CardDescription>
                    Gérez les classes, les matières et les affectations
                    {isSearchMode &&
                        ` - ${classes.length} résultat(s) trouvé(s)`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center content-center space-x-2 relative w-[300px]">
                        <Input
                            type="search"
                            className="px-[30px]"
                            value={searchClasse}
                            placeholder="Rechercher une classe..."
                            onChange={handleSearchBoxChange}
                        />
                        <Search className="absolute right-[10px] top-1/2 transform -translate-y-1/2" />
                    </div>
                    <div className="ms-4">
                        <Button onClick={() => setOpenModal(true)}>
                            <img src={DuplicateIcon} className="mr-2 h-4 w-4" />
                            Ajouter une classe
                        </Button>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="sticky top-0">
                    <TableRow>
                      <TableHead>Nom de la classe</TableHead>
                      <TableHead>Promotion</TableHead>
                      <TableHead>Salle</TableHead>
                      <TableHead>Nombre d'élèves</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-gray-400 text-md text-center p-10"
                        >
                          {searchClasse ? `Aucune classe correspondant au terme "${searchClasse}"` : "Aucune classe enregistrée pour le moment"}
                        </TableCell>
                      </TableRow>
                    )}
                    {classes.map((classe, index) => (
                      <TableRow key={classe.NumClass}>
                        <TableCell className="text-start">
                          {classe.NomClass}
                        </TableCell>
                        <TableCell className="text-start">
                          {classe.Promotion}
                        </TableCell>
                        <TableCell className="text-start">
                          {classe.Salle}
                        </TableCell>
                        <TableCell className="text-start">
                          {" "}
                          {effectifsParClasse[classe.NumClass] ?? 0}{" "}
                        </TableCell>
                        <TableCell className="text-start">
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
                                className="w-[190px] opacity-100 card shadow-lg p-0 bg-white z-20 border-[1px] border-gray-300"
                                openOnClick
                                place="right-left"
                                noArrow
                                delayHide={0}
                                positionStrategy="fixed"
                              >
                                <div>
                                  <h2 className="text-white text-center font-bold text-sm border-t-2 border-gray-300 py-2 bg-gray-500">
                                    Options
                                  </h2>
                                </div>
                                <div className="border-y-2  border-gray-300">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full rounded-none bg-white  hover:text-white hover:bg-red-500 py-5"
                                    onClick={() =>
                                      handleDelete(classe.NumClass)
                                    }
                                  >
                                    <Delete className="h-4 w-4 mr-2 text-red-800" />
                                    Supprimer classe
                                  </Button>
                                </div>
                                <div className="border-b-2  border-gray-300">
                                  <ExtractElevesButton
                                    className="w-full rounded-none bg-white py-0 hover:text-white hover:bg-emerald-600"
                                    buttonText="Importer les élèves "
                                    onExtract={(eleves) =>
                                      handleExtraction(eleves, classe.NumClass)
                                    }
                                    onError={(err) => toast.error(err.message)}
                                  />
                                </div>
                                <div className="border-gray-300">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full rounded-none bg-white  hover:text-white transition hover:bg-blue-500 py-5"
                                    onClick={() => { navigate(`/classes/notes/${classe.NumClass}`) }}
                                  >
                                    <HiLightBulb className="h-4 w-4 mr-2 text-blue-300" />
                                    Notes/Inscriptions
                                  </Button>
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