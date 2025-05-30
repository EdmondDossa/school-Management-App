import React, { useState, useEffect} from "react";
import { toast } from "react-hot-toast";
import MatiereService from "../../../services/MatiereService.js";
import { Modal, Form } from "../../components";
import { Button } from "../../components/Bouton.jsx";
import { DuplicateIcon } from "../../assets/icons/index.jsx";
import { BookOpen, Delete, Edit } from "lucide-react";
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
import EnseignerService from "../../../services/EnseignerService.js";

const columns = [{ key: "NomMat", label: "Nom de matiere" }];

const classFields = [
  { name: "NomMat", label: "Nom de la Matière", type: "text",required:true },
];

const MatieresList = () => {
  const [Matieres, setMatieres] = useState([]);
  const [matiere, setMatiere] = useState({
    CodMat: null,
    NumEtabli: null,
    NomMat: "",
  });
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);


  const fetchMatieres = async () => {
    try {
      const etablissement = await window.electronAPI.store.get("etablissement");
      setMatiere({ ...matiere, NumEtabli: etablissement.NumEtabli });
      const results = await MatiereService.getAllMatieres(
        etablissement.NumEtabli
      );
      setMatieres(results);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des Matieres");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDeletion = await window.electronAPI.confirm("Êtes-vous sûr de vouloir supprimer cette matiere ?");
    if (confirmDeletion) {
      try {
        const result = await MatiereService.deleteMatiere(id);

        //supprimer les cours concernant cette matiere
        const { Annee } = await window.electronAPI.store.get("anneeScolaireEncours");
        await EnseignerService.deleteEnseignementByMatiere(
          id,Annee
        );

        if (result.success) {
          toast.success("Matiere supprimé avec succès");
          await fetchMatieres();
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
    MatiereService.getMatiereByCode(id).then((result) => {
      if (result != null) {
        setMatiere(result);
      } else {
        toast.error("Erreur lors de la modification");
      }
    });
  };

  const handleModalClose = ()=>{
    setOpenModal(false);
    setMatiere({
      ...matiere,
      CodMat: null,
      NomMat: "",
    });
  }

  const handleSubmit = async (matiere) => {
    try {
      let result;
      if (matiere.CodMat == null) {
        result = await MatiereService.createMatiere(matiere);
      } else {
        result = await MatiereService.updateMatiere(matiere);
      }

      if (result.success) {
        toast.success(
          matiere.CodMat
            ? "Matiere modifiée avec succès"
            : "Matiere ajoutée avec succès"
        );
        await fetchMatieres();
      } else {
        toast.error("Une erreur est survenue");
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue " + error);
    }finally {
      handleModalClose();
    }
  };

  useEffect(() => {
    fetchMatieres();
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
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Gestion des Matieres</h1>
            </div>
            <Button onClick={() => setOpenModal(true)}>
              <img src={DuplicateIcon} className="mr-2 h-4 w-4" />
              Ajouter une matière
            </Button>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Liste des Matières</CardTitle>
                <CardDescription>Gérez les matières</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom de la Matière</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Matieres?.map((matiere) => (
                      <TableRow key={matiere.CodMat}>
                        <TableCell>{matiere.NomMat}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(matiere.CodMat)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(matiere.CodMat)}
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
        title="Ajouter une matiere"
      >
        <Form
          fields={classFields}
          onSubmit={handleSubmit}
          initialValues={matiere}
          submitLabel={matiere.CodMat ? "Modifier" : "Ajouter"}
        />
      </Modal>
    </>
  );
};

export default MatieresList;
