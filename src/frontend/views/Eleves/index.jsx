import React, { useState, useEffect } from "react";
import EleveService from "../../../services/EleveService";
import { toast } from "react-hot-toast";
import { Button } from "../../components/Bouton.jsx";
import { Check, Edit, Eye, Info, Search } from "lucide-react";
import { Link } from "react-router-dom";
import useDebounce from "../../hooks/use-debounce.js";
import Input from "../../components/Input.jsx";
import { Users } from "lucide-react";
import Modal from "../../components/Modal.jsx";
import Form from "../../components/Form.jsx";
import ClasseService from "../../../services/ClasseService.js";

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
import { eleveFields } from "../../utils/form-fields.js";

const tableHeadFields = ["Numéro", "Matricule", "Nom", "Prenoms", "Actions"];

const ElevesList = () => {
  const [eleves, setEleves] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [eleve, setEleve] = useState({});


  const [openEditModal, setOpenEditModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);

  //to handle students research in the search box
  const [searchEleve, setSearchEleve] = useState("");
  const optimizedSearchEleve = useDebounce(searchEleve, 500);
  const [classes, setClasses] = useState([]);
  const [classeFilter, setClasseForFilter] = useState("");

  async function fetchEleves() {
    setLoading(true);
    const result = await EleveService.getAllEleves();
    setEleves(result);
    setLoading(false);
  }

  async function fetchAppData() {
    const etablissement = await window.electronAPI.store.get("etablissement");
    setEleve({ ...eleve, NumEtabli: etablissement.NumEtabli });
    const res = await ClasseService.getAllClasses(etablissement.NumEtabli);
    setClasses(res);
  }

  async function fetchEleveForSearch() {
    const result = await EleveService.searchEleve(optimizedSearchEleve);
    if (result.success) setEleves(result.data);
    else toast.error("Une erreur est survenue pendant la recherche");
  }

  async function filterEleveByClasse() {
    if (classeFilter) {
      setSearchEleve("");
      const eleves = await EleveService.getEleveByClasse(classeFilter);
      setEleves(eleves);
    } else {
      if (eleves.length === 0) fetchEleves();
    }
  }

  const handleEdit = (matricule) => {
    EleveService.getEleveByMatricule(matricule).then((result) => {
      if (result != null) {
        setEleve(result);
        setOpenEditModal(true);
      } else {
        toast.error("Erreur lors de la modification");
      }
    });
  };

  const handleSearchBoxChange = (e) => setSearchEleve(e.target.value);

  async function handleSubmit(eleve){
    console.log(eleve);

    let result;
    try {
      result = EleveService.updateEleve(eleve);
    } catch (error) {
      console.log(error);
      toast.error("Une erreur est survenue lors de la modification")
    }finally{
      if(result.success) toast.success("Modification effectuée");
      else toast.error("Une erreur est survenue");
    }
  }

  useEffect(() => {
    fetchAppData();
  }, []);

  useEffect(() => {
    if (optimizedSearchEleve) {
        setClasseForFilter("");
        fetchEleveForSearch(optimizedSearchEleve);
    } else {
       if(!classeFilter) fetchEleves();
    }
  }, [optimizedSearchEleve]);

  useEffect(() => {
    filterEleveByClasse();
  }, [classeFilter]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <div className='flex flex-wrap justify-between content-center gap-3 items-center'>
        <div className='flex items-center content-center space-x-2 '>
          <span>
            {" "}
            <Search className='translate-x-[34px]' />{" "}
          </span>
          <Input
            type='search'
            className='ps-8'
            value={searchEleve}
            placeholder='Rechercher un eleve...'
            onChange={handleSearchBoxChange}
          />
        </div>
        <div className='place-content-center'>
          <select
            name='classes'
            id='classes'
            value={classeFilter}
            onChange={(e) => setClasseForFilter(e.target.value)}
            className='py-3 border-2  border-gray-500 outline-none bg-blue-50 px-2 rounded-md hover:outline-none text-md text-gray-500'
          >
            <option value=""> Filtrer par classe </option>

            {classes.map((classe) => (
              <option key={classe.NumClass} value={classe.NumClass}>
                {" "}
                {classe.NomClass}{" "}
              </option>
            ))}
          </select>
        </div>
      </div>
      <main className='container pt-8'>
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-4'>
            <Users className='h-8 w-8 text-primary' />
            <h1 className='text-3xl font-bold'>Gestion des Élèves</h1>
          </div>
          <div>
            <Info
              className='text-emerald-600 cursor-pointer'
              onClick={() => setOpenInfoModal(true)}
            />
          </div>
        </div>
        <div className='grid gap-6'>
          <Card className='m-auto min-w-[800px]'>
            <CardHeader>
              <CardTitle>Liste des Élèves</CardTitle>
              <CardDescription>Gérez les élèves</CardDescription>
            </CardHeader>
            <CardContent className='overflow-auto'>
              <Table className='[&_td]:text-left'>
                <TableHeader>
                  <TableRow>
                    {tableHeadFields.map((field) => (
                      <TableHead key={field}> {field} </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eleves.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className='text-gray-400 text-lg text-center flex flex-col items-center content-center'
                      >
                        <div className='text-center'>
                          {optimizedSearchEleve
                            ? `Aucun élève correspondant au terme "${optimizedSearchEleve}"`
                            : "Aucun élève enregistré pour le moment"}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {eleves?.map((eleve, index) => (
                    <TableRow key={eleve.Matricule}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{eleve.Matricule}</TableCell>
                      <TableCell>{eleve.Nom}</TableCell>
                      <TableCell className='truncate'>
                        {eleve.Prenoms.length < 25
                          ? eleve.Prenoms
                          : eleve.Prenoms.slice(0, 22) + " ..."}
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-2'>
                          <Button
                            className='px-3 border-[1px] border-blue-500'
                            size='sm'
                            variant='outline'
                            onClick={() => displayProf(eleve)}
                            title="Voir plus d'informations"
                          >
                            <Eye className='h-4 w-4 text-blue-700' />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-3"
                            title="Modifier les informations"
                            onClick={() => handleEdit(eleve.Matricule)}
                          >
                            <Edit className="h-4 w-4" />
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
      {/* Modal for informations */}
      <Modal
        isOpen={openInfoModal}
        onClose={() => setOpenInfoModal(false)}
        title='Informations'
      >
        <div className='flex items-center  text-gray-500'>
          <span>
            <Check className='w-10 h-10' />
          </span>
          <p>
            Pour les opérations de modification ou de suppresion ,assurez-vous
            de les faire aussi sur EDUCMASTER car toutes opérations effectués
            ici ne seront pas pris en compte directement là-bas.
          </p>
        </div>

        <div className='flex items-center mt-5 text-gray-500'>
          <div>
            <Check className='w-10 h-10' />
          </div>
          <p>
            Pour les opérations d'ajout, rendez-vous dans la section{" "}
            <Link to='/classes' className=' text-blue-500 font-bold'>
              {" "}
              Classes{" "}
            </Link>{" "}
            puis accéder à une classe pour importer les élèves depuis le fichier
            pdf obtenu depuis EDUCMASTER .
          </p>
        </div>
        </Modal>
        {/* Modal for editing prof informations */}
        <Modal
          isOpen={openEditModal}
          onClose={()=>setOpenEditModal(false)}
          title={"Modifier les informations de l'élève"}
      >
        <Form
          fields={eleveFields}
          onSubmit={handleSubmit}
          initialValues={eleve}
          submitLabel={"Modifier"}
        />
      </Modal>
    </>
  );
};

export default ElevesList;
