import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Table from '../../components/Table';

const columns = [
  { key: 'firstName', label: 'Prénom' },
  { key: 'lastName', label: 'Nom' },
  { key: 'dateOfBirth', label: 'Date de naissance' },
  { key: 'email', label: 'Email' },
  { key: 'className', label: 'Classe' }
];

const ElevesList = () => {
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEleves = async () => {
    try {
      const result = await window.electronAPI.dbQuery(
        'SELECT eleves.*, classes.name as className FROM eleves LEFT JOIN classes ON eleves.classId = classes.id',
        []
      );
      if (result.success) {
        setEleves(result.data);
      } else {
        toast.error('Erreur lors du chargement des eleves');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des eleves');
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchEleves();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Liste des eleves</h1>
        <Link
          to="/eleves/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Ajouter un eleve
        </Link>
      </div>
      <Table
        columns={columns}
        data={eleves}
        onDelete={handleDelete}
        editRoute="/eleves/edit"
      />
    </div>
  );
};

export default ElevesList;