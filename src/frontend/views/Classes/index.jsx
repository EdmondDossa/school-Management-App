import React, { useState, useEffect, use } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import Table from "../../components/Table";
import ClasseService from "../../../services/ClasseService.js";
import { Modal, Form, Button } from "../../components";
import { DuplicateIcon } from "../../assets/icons/index.jsx";
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
  const [classes, setClasses] = useState([]);
  const [classe, setClasse] = useState({
    NumClass: null,
    NomClass: "",
    Promotion: "6",
    NumEtabli: null,
  });
  const [loading, setLoading] = useState(true);
  const [currentEtablissement, setCurrentEtablissement] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [searchEleve, setSearchEleve] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const fetchClasses = async () => {
    try {
      const etablissement = await window.electronAPI.store.get("etablissement");
      setCurrentEtablissement(etablissement);
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

  const handleDelete = async (id) => {
    console.log(id);
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) {
      try {
        const result = ClasseService.deleteClasse(id);
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

  const handleSubmit = async (formData) => {
    try {
      let result;
      if (formData.NumClass == null) {
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
        setOpenModal(false);
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
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Liste des classes
          </h1>
          <Button
            onClick={() => setOpenModal(true)}
            className="bg-[#2871FA] text-white rounded-md"
          >
            <span className="flex items-center space-x-2 font-semibold">
              <img src={DuplicateIcon} className="h-4 w-4 mr-1" />
              Ajouter une classe
            </span>
          </Button>
        </div>
        <Table
          columns={columns}
          data={classes}
          elementKey="NumClass"
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
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
