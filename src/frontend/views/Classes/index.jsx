import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import ClasseService from "../../../services/ClasseService.js";
import { Modal, Form } from "../../components";
import { DuplicateIcon } from "../../assets/icons/index.jsx";
import AnneeScolaireService from "../../../services/AnneeScolaireService.js";
import { BookOpen, Edit,Users,Delete } from "lucide-react";
import { Button } from "../../components/Bouton.jsx";
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
import { useNavigate } from "react-router-dom";
const columns = [
  { key: "NomClass", label: "Nom de classe" },
  { key: "Promotion", label: "Promotions" },
  { key: "capacity", label: "Nombre D'étudiant" },
  { key: "teacherId", label: "Prof Principal" },
];

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
    NumEtabli: null,
  });

  const [anneesScolaires, setAnneesScolaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const fetchClasses = async () => {
    try {
      const etablissement = await window.electronAPI.store.get("etablissement");
      setClasse({ ...classe, NumEtabli: etablissement.NumEtabli });
      const result = await ClasseService.getAllClasses(etablissement.NumEtabli);
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
    const confirmDeletion = await window.electronAPI.confirm("Êtes-vous sûr de vouloir supprimer cette classe ?");
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

  const handleModalClose = ()=>{
    setOpenModal(false);
    setClasse({...classe,NomClass:"",NumClass:""});
  }
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
        <main className="container mx-auto py-8">
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
            <Card>
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
                    {classes.map((classe) => (
                      <TableRow key={classe.NumClass}>
                        <TableCell>{classe.NomClass}</TableCell>
                        <TableCell>{classe.Promotion}</TableCell>
                        <TableCell>0</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={()=>navigate(`/config-class/${classe.NumClass}`)}
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              Matières
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(classe.NumClass)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(classe.NumClass)}
                            >
                              <Delete className="h-4 w-4 mr-2" />
                              Supprimer
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
