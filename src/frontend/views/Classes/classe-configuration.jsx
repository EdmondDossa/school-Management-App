import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Modal } from "../../components";
import { DuplicateIcon } from "../../assets/icons/index.jsx";
import { SettingsIcon,Delete } from "lucide-react";
import { Button } from "../../components/Bouton.jsx";
import EnseignerService from "../../../services/EnseignerService.js";
import ClasseService from "../../../services/ClasseService.js";
import {
  Card,
  CardContent,
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
import CoefficientService from "../../../services/CoefficientService.js";

const tableHeadFields = ["Matiere","Professeur","Coefficient","Action"];
const initialValues = {
  CodMat:"",
  NumProf:"",
  Coef:1
};


const ClasseConfiguration =  () => {
  const { id:NumClass } = useParams();
  
  const [InfoScolaire,setInfoScolaire] = useState({ NumEtabli:'', Annee:''});
  const ref = useRef();

  const [isLoading,setLoading ] = useState(true);
  const [isLoadingComponentData,setLoadingComponentData] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [isUpdatingCoef,setIsUpdatingCoef] = useState(false);
  const [coefToUpdate,setCoefToUpdate] = useState('');

  const [matieres,setMatieres] = useState([]);
  const [professeurs,setProfesseurs] = useState([]);
  const [classe,setClasse] = useState({});
  const [filteredProfesseurs,setFilteredProfesseurs] = useState([]);
  const [enseignements,setEnseignements] = useState([]);
  const [cours,setCours] = useState(initialValues);

  
  async function fetchInfoScolaire(){
    const { NumEtabli } = await window.electronAPI.store.get("etablissement");
    const { Annee } = await window.electronAPI.store.get("anneeScolaireEncours");
    setInfoScolaire({ NumEtabli, Annee });
    setLoading(false);
  } 

  function handleChange(e){
    const {name,value } = e.target;
    setCours(
      {...cours,[name]:value }
    );
  }
  
  function closeModal(){
    setOpenModal(false);
    setFilteredProfesseurs([]);
  }
  
  async function fetchMatieresEtProfLibres(){
    const {
      matieresNonAssignees,
      professeursCorrespondants
    } = await EnseignerService.getMatieresNonEncoreAssigneeAClasse(
      InfoScolaire.Annee,NumClass
    );
    setMatieres(matieresNonAssignees);
    setProfesseurs(professeursCorrespondants);
  }

  async function fetchCurrentClasse(){
    const result = await ClasseService.getClasseByNumClass(NumClass);  
    setClasse(result);
  }

  async function fetchEnseignements(){
    const result = await EnseignerService.getEnseignements(
      InfoScolaire.Annee,NumClass
    );
    setEnseignements(result);
  }

async function loadData(){
  setLoadingComponentData(true);
  await fetchCurrentClasse();
  await fetchMatieresEtProfLibres();
  await fetchEnseignements();
  setLoadingComponentData(false);
};

async function handleSubmit(e){
  e.preventDefault(); 
  try {
    const enseignement = { 
      ...cours,
      NumEtabli:InfoScolaire.NumEtabli,
      Annee:InfoScolaire.Annee,
      NumClass
    };
    const coefficient = {
      CodMat:cours.CodMat,
      Coef:cours.Coef,
      NumClass,
      Annee:InfoScolaire.Annee
    };

    await EnseignerService.createEnseignement(enseignement);  
    await CoefficientService.createCoefficient(coefficient);
    toast.success("Le cours a bien été ajoutee");
    
    await fetchMatieresEtProfLibres();
    await fetchEnseignements();
    closeModal();
  } catch (error) {
    toast.error("Une erreur est survenue.");
  }
};


async function handleDelete(CodMat,NumProf){
  const confirmDelete = await window.electronAPI.confirm("Etes vous sûr(e) de vouloir supprimer ce cours ?");
  if(confirmDelete){
    try {
      const enseignement = {
        NumProf,
        CodMat,
        Annee:InfoScolaire.Annee,
        NumClass
      };
      await EnseignerService.deleteEnseignement(enseignement);  
      
      await CoefficientService.deleteCoefficient(
        CodMat,InfoScolaire.Annee,NumClass
      );

      await fetchMatieresEtProfLibres();
      await fetchEnseignements();
      setCours(initialValues);
      
      toast.success("Enseignement supprimer avec succes");
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression");
    } 
  }
}

async function handleCoefficientUpdate(CodMat){
  if(Number(coefToUpdate.trim()) && +(coefToUpdate.trim()) >=1){
    await CoefficientService.update(
      CodMat,NumClass,InfoScolaire.Annee,+(coefToUpdate.trim())
    );
    await fetchEnseignements();
    toast.success("Coefficient modifié!")
  }else{
    toast.error("Coefficient invalide");
  }
  setIsUpdatingCoef(false);
}

useEffect(()=>{
  fetchInfoScolaire();
},[])

useEffect(()=>{
  if(!isLoading) loadData();
},[isLoading]);

useEffect(()=>{
  const profCorrespondant = professeurs.filter((prof) => +prof.CodMat === +cours.CodMat);
  setFilteredProfesseurs(profCorrespondant);
},[cours.CodMat])

  if(isLoadingComponentData) return <div>Chargement ...</div>

  return (
    <>
      <div>
        <main className="container mx-auto py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <SettingsIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Configurer la classe { classe.NomClass } </h1>
            </div>
            <Button onClick={() => setOpenModal(true)}>
              <img src={DuplicateIcon} className="mr-2 h-4 w-4" />
              Ajouter un cours
            </Button>
          </div>
          <div className="grid gap-6">
          <Card>
              <CardHeader>
                <CardTitle>Liste des cours</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                    { tableHeadFields.map((field) => <TableHead className="text-center" key={field}> { field } </TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    { enseignements.map((enseignement,index) =>
                      (<TableRow key={index} >
                        <TableCell> { enseignement.NomMat } </TableCell>
                        <TableCell> { `${enseignement.NomProf} ${enseignement.PrenomsProf}`  } </TableCell>

                        <TableCell
                          title="Double cliquer pour modifier"
                          onClick={()=>setIsUpdatingCoef(true)}
                          contentEditable={isUpdatingCoef}
                          onInput = {(e) => setCoefToUpdate(e.target.innerText)}
                          ref={ref}
                          onBlur={() => handleCoefficientUpdate(enseignement.CodMat)}
                        >
                           { enseignement.Coef} 
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            title="Supprimer le cours"
                            className="cursor-pointer"
                            onClick={()=>handleDelete(enseignement.CodMat,enseignement.NumProf)}
                          >
                            <Delete className="h-2 w-4 mr-1" />
                          </Button>
                          </TableCell>
                      </TableRow>)
                    ) }

                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
        
      </div>

      <Modal
        isOpen={openModal}
        onClose={closeModal}
        title="Nouveau cours"
      >
          <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <FormLabel>Matieres</FormLabel>
                <select 
                  name="CodMat" 
                  id="Matieres" 
                  onChange={handleChange}
                  className="h-10 p-2 mt-1 block w-full rounded-md border-[2px] border-gray-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Choisir la matiere</option>
                  {
                    matieres.map((matiere) =><option key={matiere.CodMat} value={matiere.CodMat}> { matiere.NomMat } </option> )
                  }
                </select>
              </div>
              <div>
                <FormLabel>Définir le coefficient</FormLabel>
                <input 
                  type="number" 
                  min="1"
                  defaultValue={1}
                  name="Coef"
                  onChange={handleChange}
                  className="mt-1 block h-10 p-2 w-full rounded-md border-[2px] border-gray-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <FormLabel>Professeur</FormLabel>
                <select 
                  name="NumProf" 
                  id="Professeur" 
                  onChange={handleChange}
                  className="h-10 p-2 mt-1 block w-full rounded-md border-[2px] border-gray-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Attribuer un professeur</option>
                  {
                    filteredProfesseurs.length === 0 
                      ? <option value="" disabled>Aucun professeur disponible pour cette matiere</option>
                      : filteredProfesseurs.map((prof) =>
                        prof.NumProf 
                          ?
                          <option key={prof.NumProf} value={prof.NumProf}>
                            { `${prof.NomProf} ${prof.PrenomsProf}`} 
                          </option> 
                          :
                          <option value="" disabled>Aucun professeur disponible pour cette matiere</option>
                      )
                  }
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 focus:ring-0 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Ajouter
                </button>
              </div>
          </form>
      </Modal>
    </>
  );
};

function FormLabel ({children}){
  return (
  <label
    htmlFor={children}
    className="block text-sm font-medium text-gray-700"
  > {children } 
</label>
);
}

export default ClasseConfiguration;
