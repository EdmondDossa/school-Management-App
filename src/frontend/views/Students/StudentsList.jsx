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

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const result = await window.electronAPI.dbQuery(
        'SELECT students.*, classes.name as className FROM students LEFT JOIN classes ON students.classId = classes.id',
        []
      );
      if (result.success) {
        setStudents(result.data);
      } else {
        toast.error('Erreur lors du chargement des étudiants');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des étudiants');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      try {
        const result = await window.electronAPI.dbQuery(
          'DELETE FROM students WHERE id = ?',
          [id]
        );
        if (result.success) {
          toast.success('Étudiant supprimé avec succès');
          fetchStudents();
        } else {
          toast.error('Erreur lors de la suppression');
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Liste des étudiants</h1>
        <Link
          to="/students/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Ajouter un étudiant
        </Link>
      </div>
      <Table
        columns={columns}
        data={students}
        onDelete={handleDelete}
        editRoute="/students/edit"
      />
    </div>
  );
};

export default StudentsList;