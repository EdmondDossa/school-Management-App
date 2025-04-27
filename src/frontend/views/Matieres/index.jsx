import React, { useState, useEffect, use } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import Table from "../../components/Table";
import MatiereService from "../../../services/MatiereService.js";
import { Modal, Form } from "../../components";
import { Button } from "../../components/Bouton.jsx";
import { DuplicateIcon } from "../../assets/icons/index.jsx";
const columns = [{ key: "NomMat", label: "Nom de matiere" }];

const classFields = [
  { name: "NomMat", label: "Nom de la Matière", type: "text" },
];

const MatieresList = () => {
  const [Matieres, setMatieres] = useState([]);
  const [matiere, setMatiere] = useState({
    CodMat: null,
    NumEtabli: null,
    NomMat: "",
  });
  const [loading, setLoading] = useState(true);
  const [currentEtablissement, setCurrentEtablissement] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [searchEleve, setSearchEleve] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const fetchMatieres = async () => {
    try {
      const etablissement = await window.electronAPI.store.get("etablissement");
      setCurrentEtablissement(etablissement);
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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette matiere ?")) {
      try {
        const result = MatiereService.deleteMatiere(id);
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
        setOpenModal(false);
        await fetchMatieres();
      } else {
        toast.error("Une erreur est survenue");
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue " + error);
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Liste des Matieres
          </h1>
          <Button
            onClick={() => setOpenModal(true)}
            className="bg-[#2871FA] text-white rounded-md"
          >
            <span className="flex items-center space-x-2 font-semibold">
              <img src={DuplicateIcon} className="h-4 w-4 mr-1" />
              Ajouter une matiere
            </span>
          </Button>
        </div>
        <Table
          name="MATIERES"
          columns={columns}
          data={Matieres}
          elementKey="CodMat"
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
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
