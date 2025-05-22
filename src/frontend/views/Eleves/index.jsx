import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Table, Input, Modal, Form } from "../../components/";
import { Button } from "../../components/Bouton";
import EleveService from "../../../services/EleveService";
import { DuplicateIcon, ExportCSVIcon, SearchIcon } from "../../assets/icons";
import Pagination from "../../components/Pagination";
import { v4 as uniqid } from "uuid";
import { useSearchParams } from "react-router-dom";
import useDebounce from "../../hooks/use-debounce";

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
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [eleve, setEleve] = useState({
    Matricule: "",
    Nom: "",
    Prenoms: "",
    Sexe: "M",//default value if this field do not change
    DateNaissance: "",
    LieuNaissance: "",
    Nationalite: "",
    ContactParent: "",
    NumEtabli: "",
  });

  //searchParams hook is useful to substract query params in the search bar
  const [searchParams,setSearchParams] = useSearchParams();
  const matriculeToEdit = searchParams.get("id");

  //to handle students research in the search box
  const [searchEleve,setSearchEleve] = useState("");
  const optimizedSearchEleve = useDebounce(searchEleve,500);

  const setupEdit = async (matricule)=>{
    const result = await EleveService.getEleveByMatricule(matricule);
    setEleve({ ...result });
    setOpenModal(true);
  }

  const fetchEleves = async () => {
    setLoading(true);
    const result = await EleveService.getAllEleves();
    setEleves(result);
    setLoading(false);
  };

  const handleDelete = async (matricule) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet eleve ?")) {
      try {
        const result = await EleveService.deleteEleve(matricule);
        if (result.success) {
          toast.success("Étudiant supprimé avec succès");
          await fetchEleves();
        } else {
          toast.error("Erreur lors de la suppression");
        }
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleSearchBoxChange = (e) => setSearchEleve(e.target.value);

  const closeModal = () =>{
    setOpenModal(false);
    setSearchParams({});
  }
  

  const handleSubmit = async (formData) => {
        try {
          let result;
          if (formData.Matricule === "") {
            result = await EleveService.createEleve({...formData,Matricule: uniqid().slice(0,23)});
          } else {
            result = await EleveService.updateEleve(formData);
            setSearchParams({});//remove the id query value from the search bar
          }

          if (result.success) {
            toast.success(
              eleve.Matricule ? "Étudiant modifié avec succès" : "Étudiant ajouté avec succès"
            );
            await fetchEleves();
            closeModal();
          } else {
            toast.error("Une erreur est survenue");
          }
        } catch (error) {
          toast.error("Une erreur est survenue");
        }
  };

  const setCurrentEtablissement = async  () => {
    const etablissement = await window.electronAPI.store.get("etablissement");
    setEleve({...eleve, NumEtabli:etablissement.NumEtabli })
  };

  const fetchEleveForSearch = async  () => {
    const result = await EleveService.searchEleve(optimizedSearchEleve);
    if(result.success) setEleves(result.data);
    else toast.error("Une erreur est survenue pendant la recherche")
  };

  useEffect(()=>{
    if(matriculeToEdit) setupEdit(matriculeToEdit)
  },[matriculeToEdit]);

  useEffect(() => {
    setCurrentEtablissement();
  }, []);

  useEffect(()=>{
    if(optimizedSearchEleve) fetchEleveForSearch(optimizedSearchEleve);
    else fetchEleves();
  },[optimizedSearchEleve]);


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
              onChange={handleSearchBoxChange}
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
          editRoute="/eleves"
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
        onClose={closeModal}
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
