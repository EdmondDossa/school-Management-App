import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {Table, Button, Input} from '../../components/index';
import EleveController from '../../../controllers/EleveController';
import { DuplicateIcon, ExportCSVIcon, SearchIcon } from '../../assets/icons';
import Pagination from '../../components/Pagination';

const columns = [
  { key: 'Matricule', label: 'Matricule' },
  { key: 'Nom', label: 'Nom' },
  { key: 'Prenom', label: 'Prénoms' },
  { key: 'DateNaissance', label: 'Date de naissance' },
  { key: 'LieuNaissance', label: 'Lieu de naissance' },
  { key: 'Nationalite', label: 'Nationalite' },
  { key: 'ContactParent', label: 'Contact de Parent' }
];

const ElevesList = () => {
  const [eleves, setEleves] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [searchEleve, setSearchEleve] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEleves = async () => {
    setLoading(true);
    const result = await EleveController.getAllEleves();
    setEleves(result);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet eleve ?')) {
      try {
        const result = await window.electronAPI.dbQuery(
          'DELETE FROM eleves WHERE id = ?',
          [id]
        );
        if (result.success) {
          toast.success('Étudiant supprimé avec succès');
          fetchEleves();
        } else {
          toast.error('Erreur lors de la suppression');
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleSearchEleve = (e) => {
    const { name, value } = e.target;
    setSearchEleve(value);
  };
  useEffect(() => {
    fetchEleves();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className='flex space-x-2'>
          <Input 
            type="search"
            value={searchEleve}
            placeholder="Rechercher un eleve..."
            onChange={handleSearchEleve}
          />
          <Button className="bg-[#2871FA1A]">
            <img src={SearchIcon} className='h-6 w-6'/>
          </Button>
        </div>
        <Button
          className="bg-[#078A00] text-white rounded-md"
        >          
          <Link
            to="/eleves/add"
            className='flex items-center space-x-2 font-semibold'
          >
            <img src={ExportCSVIcon} className='h-4 w-4 mr-1'/>
            Importer un fichier
          </Link>
        </Button>
        <Button
          className="bg-[#2871FA] text-white rounded-md"
        >          
          <Link
            to="/eleves/add"
            className='flex items-center space-x-2 font-semibold'
          >
            <img src={DuplicateIcon} className='h-4 w-4 mr-1'/>
            Ajouter un eleve
          </Link>
        </Button>
      </div>
      <Table
        name="ELEVES"
        loading={loading}
        columns={columns}
        data={eleves}
        onDelete={handleDelete}
        editRoute="/eleves/edit"
      />
      {totalPages>1 && <div className='flex w-full justify-end items-center' >
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>}
    </div>
  );
};

export default ElevesList;