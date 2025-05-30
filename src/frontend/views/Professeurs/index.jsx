import React, { useState, useEffect} from "react";
import { toast } from "react-hot-toast";
import ProfesseurService from "../../../services/ProfesseurService.js";
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


const professeurFields = [
  { name: "NomProf", label: "Nom du professeur", type: "text",required:true },
  { name: "PrenomsProf", label: "Prenom du professeur", type: "text",required:true },
  { name: "Sexe", label: "Sexe", type: "select" ,required:true ,
    options: [
      { label: "Masculin", value: "M" },
      { label: "Féminin", value: "F" },
    ] },
  { name: "Adresse", label: "Adresse", type: "text" ,required:true  },
  { name: "Telephone", label: "Telephone", type: "tel" ,required:true  },
  { name: "Email", label: "Email", type: "email" ,required:true  },
  { name: "DateNaissance", label: "Date de naissance", type: "date" ,required:true  },
  { name: "LieuNaissance", label: "Lieu de naissance", type: "text" ,required:true  },
  { name: "Nationalite", label: "Nationalite", type: "text" ,required:true  },
];

const tableHeadFields = [
  "Nom",
  "Prenom",
  "Sexe",
  "Matiere",
  "Email",
  "Adresse",
  "Telephone",
  "Date de naissance",
  "Lieu de naissance",
  "Nationalite",
  "Actions"
];

const Professeur = () => {
  const [Professeurs, setProfesseurs] = useState([]);

  const initialValues = {
    NumProf:'',
    NomProf:'',
    PrenomsProf:'',
    Sexe:'M',
    CodMat:'',
    Email:'',
    Adresse:'',
    Telephone:'',
    DateNaissance:'',
    LieuNaissance:'',
    Nationalite:'',
    };
  
  const [professeur, setProfesseur] = useState(initialValues);
  const [matieres,setMatieres] =useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  

  const fetchProfesseurs = async () => {
    try {
      const etablissement = await window.electronAPI.store.get("etablissement");
      setProfesseur({ ...professeur, NumEtabli: etablissement.NumEtabli });
      let results = await ProfesseurService.getAllProfesseurs(
        etablissement.NumEtabli
      );
      setProfesseurs(results);

    } catch (error) {
      toast.error("Erreur lors du chargement des professeurs");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatieres = async () =>{
    const etablissement = await window.electronAPI.store.get("etablissement");
    const result = await MatiereService.getAllMatieres(etablissement.NumEtabli);
    setMatieres(result);
  };


  const handleDelete = async (id) => {
    const confirmDeletion = await window.electronAPI.confirm("Êtes-vous sûr de vouloir supprimer ce professeur?");
    if (confirmDeletion) {
      try {
        const result = await ProfesseurService.deleteProfesseur(id);

        //supprimer le cours enseigner par ce professeur
        const { Annee } = await window.electronAPI.store.get("anneeScolaireEncours");
        await EnseignerService.deleteEnseignementByProfesseur(
          id,Annee
        );
        if (result.success) {
          toast.success("Professeur supprimé avec succès");
          await fetchProfesseurs();
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
    ProfesseurService.getProfesseurByNum(id).then((result) => {
      if (result != null) {
        setProfesseur(result);
      } else {
        toast.error("Erreur lors de la modification");
      }
    });
  };

  const handleModalClose = ()=>{
    setOpenModal(false);
    setProfesseur({
      ...initialValues,NumEtabli:professeur.NumEtabli
    })
  }

  const handleSubmit = async (professeur) => {
    try {
      let result;
      if (!professeur.NumProf) {
        result = await ProfesseurService.createProfesseur(professeur);
      } else {
        result = await ProfesseurService.updateProfesseur(professeur);
      }

      if (result.success) {
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
    }finally{
      handleModalClose();
    }

  };

  const updateProfesseurFields = ()=>{
    if(matieres.length > 0 ) {
      if(professeurFields[0].name != "CodMat"){
        professeurFields.unshift(
          {
            name:"CodMat",label:"Matiere Enseignee",type:"select",required:true,
            options:[
              { label:"Choisir une matiere", value:"" },
                ...matieres.map((matiere)=>({ label:matiere.NomMat, value:matiere.CodMat }))
              ]
          }
      )
      }else{
        professeurFields[0].options = [
          { label:"Choisir une matiere", value:"" },
            ...matieres.map((matiere)=>({ label:matiere.NomMat, value:matiere.CodMat }))
          ];
      }
     }
  };

  useEffect(() => {
    fetchProfesseurs();
    fetchMatieres();
  }, []);

  useEffect(()=>{
    updateProfesseurFields();
  },[matieres])

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
              <h1 className="text-3xl font-bold">Gestion des Professeurs</h1>
            </div>
            <Button onClick={() => setOpenModal(true)}>
              <img src={DuplicateIcon} className="mr-2 h-4 w-4" />
              Ajouter un professeur
            </Button>
          </div>

          <div className="grid gap-6">
            <Card className="overflow-auto">
              <CardHeader>
                <CardTitle>Liste des Professeurs</CardTitle>
                <CardDescription>Gérez les professeurs</CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                    { tableHeadFields.map((field) => <TableHead key={field}> { field } </TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody >
                    {Professeurs?.map((professeur) => (
                      <TableRow key={professeur.NumProf}>
                        {
                          Object.keys(initialValues).map(((key) => {
                            //because we don't wanna show the profNum in a cell so we skip it
                            if (key != "NumProf" && key !="CodMat" ) return  <TableCell key={key}> { professeur[key] } </TableCell>;

                            if (key === "CodMat") 
                               return <TableCell key={key}> 
                                            { (matieres.find((matiere) => matiere.CodMat === +professeur["CodMat"]))?.NomMat ?? "---" } 
                                       </TableCell>
                              }
                        ))
                        }
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(professeur.NumProf)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(professeur.NumProf)}
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
        title="Ajouter une professeur"
      >
        <Form
          fields={professeurFields}
          onSubmit={handleSubmit}
          initialValues={professeur}
          submitLabel={professeur.NumProf ? "Modifier" : "Ajouter"}
        />
      </Modal>
    </>
  );
};

export default Professeur;
