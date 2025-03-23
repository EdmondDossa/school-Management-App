import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Form from '../../components/Form';
import ClasseController from '../../../controllers/ClasseController';


const EleveForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [eleve, setEleve] = useState({
    firstName:'',
    lastName:'',
    dateOfBirth:'',
    email:'',
    phoneNumber:'',
    address:'',
    classId:''
  });
  const [classes, setClasses] = useState([]);

  const eleveFields = [
    { name: 'firstName', label: 'Prénom', type: 'text' },
    { name: 'lastName', label: 'Nom', type: 'text' },
    { name: 'dateOfBirth', label: 'Date de naissance', type: 'date' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phoneNumber', label: 'Téléphone', type: 'tel' },
    { name: 'address', label: 'Adresse', type: 'textarea' },
    { name: 'classId', label: 'Classe', type: 'select', options: classes }
  ];

  useEffect(() => {
    // Charger les classes
    const fetchClasses = async () => {
      const result = await ClasseController.getAllClasses();
      if (result.success) {
        setClasses(result.data);
      }
    };

    // Charger l'étudiant si on est en mode édition
    const fetchEleve = async () => {
      if (id) {
        const result = await window.electronAPI.dbQuery(
          'SELECT * FROM eleves WHERE id = ?',
          [id]
        );
        if (result.success && result.data.length > 0) {
          setEleve(result.data[0]);
        }
      }
    };

    fetchClasses();
    fetchEleve();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      let result;
      if (id) {
        result = await window.electronAPI.dbQuery(
          `UPDATE eleves SET 
           firstName = ?, lastName = ?, dateOfBirth = ?, 
           email = ?, phoneNumber = ?, address = ?, classId = ?
           WHERE id = ?`,
          [
            formData.firstName,
            formData.lastName,
            formData.dateOfBirth,
            formData.email,
            formData.phoneNumber,
            formData.address,
            formData.classId,
            id
          ]
        );
      } else {
        result = await window.electronAPI.dbQuery(
          `INSERT INTO eleves 
           (firstName, lastName, dateOfBirth, email, phoneNumber, address, classId)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            formData.firstName,
            formData.lastName,
            formData.dateOfBirth,
            formData.email,
            formData.phoneNumber,
            formData.address,
            formData.classId
          ]
        );
      }

      if (result.success) {
        toast.success(id ? 'Étudiant modifié avec succès' : 'Étudiant ajouté avec succès');
        navigate('/eleves');
      } else {
        toast.error('Une erreur est survenue');
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {id ? 'Modifier l\'étudiant' : 'Ajouter un étudiant'}
      </h1>
      <Form
        fields={eleveFields}
        onSubmit={handleSubmit}
        initialValues={eleve}
        submitLabel={id ? 'Modifier' : 'Ajouter'}
      />
    </div>
  );
};

export default EleveForm;