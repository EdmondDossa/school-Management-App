import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Table from '../../components/Table';
import ClasseService from '../../../services/ClasseService.js';
const columns = [
  { key: 'name', label: 'Nom de classe' },
  { key: 'promotion', label: 'Promotions' },
  { key: 'capacity', label: "Nombre D'étudiant" },
  { key: 'teacherId', label: 'Prof Principal' }
];

const ClassesList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      const result = await ClasseService.getAll();
      if (result.success) {
        setClasses(result.data);
      } else {
        toast.error('Erreur lors du chargement des classes1');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des classes2');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      try {
        const result = await window.electronAPI.dbQuery(
          'DELETE FROM classes WHERE id = ?',
          [id]
        );
        if (result.success) {
          toast.success('Classe supprimé avec succès');
          fetchClasses();
        } else {
          toast.error('Erreur lors de la suppression');
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Liste des étudiants</h1>
        <Link
          to="/classes/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Ajouter une classe
        </Link>
      </div>
      <Table
        columns={columns}
        data={classes}
        onDelete={handleDelete}
        editRoute="/classes/edit"
      />
    </div>
  );
};

export default ClassesList;