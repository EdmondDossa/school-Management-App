import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Modal } from "../../components";
import { Button } from "../../components/Bouton.jsx";
import { BookOpen, Trash, Edit, Palette } from "lucide-react";
import { electronConfirm, getAnneeScolaire } from "../../utils/index.js";
import { MatiereService, EnseignerService } from "../../../services/";
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
import { Label, Input } from "../../components";

const MatieresList = () => {
  const [matieres, setMatieres] = useState([]);
  const [currentMatiere, setCurrentMatiere] = useState({
    CodMat: null,
    NomMat: "",
    Couleur: "#000000",
  });
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const fetchMatieres = async () => {
    setLoading(true);
    try {
      const results = await MatiereService.getAllMatieres();
      setMatieres(results);
    } catch (error) {
      toast.error("Erreur lors du chargement des matières.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      await electronConfirm(
        "Êtes-vous sûr de vouloir supprimer cette matière ?"
      )
    ) {
      try {
        const result = await MatiereService.deleteMatiere(id);
        const { Annee } = await getAnneeScolaire("anneeScolaireEncours");
        if (result.success) {
          await EnseignerService.deleteEnseignementByMatiere(id, Annee);
          toast.success("Matière supprimée avec succès.");
          fetchMatieres();
        } else {
          toast.error("Erreur lors de la suppression.");
        }
      } catch (error) {
        toast.error("Erreur lors de la suppression.");
      }
    }
  };

  const handleEdit = async (id) => {
    const result = await MatiereService.getMatiereByCode(id);
    if (result) {
      setCurrentMatiere({ ...result, Couleur: result.Couleur || "#000000" });
      setOpenModal(true);
    } else {
      toast.error("Erreur lors de la récupération de la matière.");
    }
  };

  const handleAddNew = () => {
    setCurrentMatiere({ CodMat: null, NomMat: "", Couleur: "#000000" });
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setCurrentMatiere({ CodMat: null, NomMat: "", Couleur: "#000000" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = currentMatiere.CodMat
        ? await MatiereService.updateMatiere(currentMatiere)
        : await MatiereService.createMatiere(currentMatiere);

      if (result.success) {
        toast.success(
          currentMatiere.CodMat ? "Matière modifiée." : "Matière ajoutée."
        );
        fetchMatieres();
      } else {
        toast.error("Une erreur est survenue.");
      }
    } catch (error) {
      toast.error("Une erreur est survenue: " + error.message);
    } finally {
      handleModalClose();
    }
  };

  useEffect(() => {
    fetchMatieres();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <>
      <main className="pt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Gestion des Matières</h1>
          </div>
          <Button onClick={handleAddNew}>
            <Palette className="mr-2 h-4 w-4" />
            Ajouter une matière
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Liste des Matières</CardTitle>
            <CardDescription>
              Gérez les matières et leurs Couleurs associées.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de la Matière</TableHead>
                  <TableHead>Couleur</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matieres.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-gray-400"
                    >
                      Aucune matière enregistrée.
                    </TableCell>
                  </TableRow>
                ) : (
                  matieres.map((matiere) => (
                    <TableRow key={matiere.CodMat}>
                      <TableCell>{matiere.NomMat}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: matiere.Couleur }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(matiere.CodMat)}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Modifier
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(matiere.CodMat)}
                          >
                            <Trash className="h-4 w-4 mr-2" /> Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Modal
        isOpen={openModal}
        onClose={handleModalClose}
        title={
          currentMatiere.CodMat ? "Modifier la matière" : "Ajouter une matière"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nomMat">Nom de la matière</Label>
            <Input
              id="nomMat"
              type="text"
              value={currentMatiere.NomMat}
              onChange={(e) =>
                setCurrentMatiere({ ...currentMatiere, NomMat: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="CouleurMat">Couleur</Label>
            <div className="flex items-center gap-2">
              <Input
                id="CouleurMat"
                type="color"
                value={currentMatiere.Couleur}
                onChange={(e) =>
                  setCurrentMatiere({
                    ...currentMatiere,
                    Couleur: e.target.value,
                  })
                }
                className="p-1 h-10 w-[100px] block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none "
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={handleModalClose}>
              Annuler
            </Button>
            <Button type="submit">
              {currentMatiere.CodMat ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default MatieresList;
