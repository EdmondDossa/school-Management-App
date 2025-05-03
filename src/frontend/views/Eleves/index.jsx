import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Table, Input, Modal, Form } from "../../components/index";
import { Button } from "../../components/Bouton.jsx";
import EleveService from "../../../services/EleveService";
import { DuplicateIcon, ExportCSVIcon, SearchIcon } from "../../assets/icons";
import Pagination from "../../components/Pagination";

const eleveFields = [
  { name: "Nom", label: "Nom", type: "text" },
  { name: "Prenoms", label: "Prénoms", type: "text" },
  {
    name: "Sexe",
    label: "Sexe",
    type: "select",
    options: [
      { label: "Masculin", value: "M" },
      { label: "Féminin", value: "F" },
    ],
  },
  { name: "DateNaissance", label: "Date de naissance", type: "date" },
  { name: "LieuNaissance", label: "Lieu de naissance", type: "text" },
  { name: "Nationalite", label: "Nationalité", type: "text" },
  { name: "ContactParent", label: "Contact de l'étudiant", type: "tel" },
];

const columns = [
  { key: "Matricule", label: "Matricule" },
  { key: "Nom", label: "Nom" },
  { key: "Prenoms", label: "Prénoms" },
  { key: "Sexe", label: "Sexe" },
  { key: "DateNaissance", label: "Date de naissance" },
  { key: "LieuNaissance", label: "Lieu de naissance" },
  { key: "Nationalite", label: "Nationalite" },
  { key: "ContactParent", label: "Contact de Parent" },
];

const ElevesList = () => {
  const [eleves, setEleves] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [searchEleve, setSearchEleve] = useState("");
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [eleve, setEleve] = useState({
    Matricule: "",
    Nom: "",
    Prenoms: "",
    Sexe: "",
    DateNaissance: "",
    LieuNaissance: "",
    Nationalite: "",
    ContactParent: "",
    NumEtabli: "",
  });
  const [classes, setClasses] = useState([]);

  const fetchEleves = async () => {
    setLoading(true);
    const result = await EleveService.getAllEleves();
    setEleves(result);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet eleve ?")) {
      try {
        const result = await window.electronAPI.dbQuery(
          "DELETE FROM eleves WHERE id = ?",
          [id]
        );
        if (result.success) {
          toast.success("Étudiant supprimé avec succès");
          fetchEleves();
        } else {
          toast.error("Erreur lors de la suppression");
        }
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleSearchEleve = (e) => {
    const { name, value } = e.target;
    setSearchEleve(value);
  };

  const handleSubmit = async (formData) => {
    try {
      let result;
      if (formData.Matricule !== "") {
        result = await EleveService.createEleve(formData);
      } else {
        result = await EleveService.updateEleve(formData);
      }

      if (result.success) {
        toast.success(
          id ? "Étudiant modifié avec succès" : "Étudiant ajouté avec succès"
        );
        await fetchEleves();
      } else {
        toast.error("Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };
  useEffect(() => {
    fetchEleves();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex space-x-2">
            <Input
              type="search"
              value={searchEleve}
              placeholder="Rechercher un eleve..."
              onChange={handleSearchEleve}
            />
            <Button className="bg-[#2871FA1A]">
              <img src={SearchIcon} className="h-6 w-6" />
            </Button>
          </div>
          <Button className="bg-[#078A00] text-white rounded-md">
            <span className="flex items-center space-x-2 font-semibold">
              <img src={ExportCSVIcon} className="h-4 w-4 mr-1" />
              Importer un fichier
            </span>
          </Button>
          <Button
            onClick={() => setOpenModal(true)}
            className="bg-[#2871FA] text-white rounded-md"
          >
            <span className="flex items-center space-x-2 font-semibold">
              <img src={DuplicateIcon} className="h-4 w-4 mr-1" />
              Ajouter un eleve
            </span>
          </Button>
        </div>
        <Table
          name="ELEVES"
          loading={loading}
          columns={columns}
          data={eleves}
          elementKey="Matricule"
          onDelete={handleDelete}
          editRoute="/eleves/edit"
        />
        {totalPages > 1 && (
          <div className="flex w-full justify-end items-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title="Ajouter un élève"
      >
        <Form
          fields={eleveFields}
          onSubmit={handleSubmit}
          initialValues={eleve}
          submitLabel={eleve.Matricule ? "Modifier" : "Ajouter"}
        />
      </Modal>
    </>
  );
};

export default ElevesList;
