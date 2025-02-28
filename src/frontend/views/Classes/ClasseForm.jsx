import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Form from '../../components/Form';
import ClasseController from '../../../controllers/ClasseController.js';


const ClasseForm = () => {
  const classeFields = [
    { name: 'name', label: 'Nom de la classe', type: 'text' },
    { name: 'promotion', label: 'Promotion', type: 'select', options: [
        { value: '6', label: '6 ème' }, 
        { value: '5', label: '5 ème' },
        { value: '4', label: '4 ème' },
        { value: '3', label: '3 ème' },
        { value: '2', label: '2 nde' },
        { value: '1', label: '1 ère' },
        { value: 'T', label: 'Tle' }
      ] 
    },
    { name: 'capacity', label: "Nombre d'élèves", type: 'number' },
    { name: 'teacherId', label: 'Prof Principal', type: 'select', options: [{ value: 1, label: 'Prof 1' }, { value: 2, label: 'Prof 2' }] }
  ];
  const { id } = useParams();
  const navigate = useNavigate();
  const [classe, setClasse] = useState({
    name: '',
    promotion: '6',
    capacity: 0,
    teacherId: 0
  });
  const [loading, setLoading] = useState(true);
  //const [profs, setProfs] = useState([{ id: 1, name: 'Prof 1' }, { id: 2, name: 'Prof 2' }]);

  // Charger la classe si on est en mode édition
  const fetchClasse = async () => {
    if (id) {
      const result = await ClasseController.getById(id);
      if (result.success && result.data.length > 0) {
        setClasse(result.data[0]);
      }
    }
  };

  useEffect(() => {
    fetchClasse();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      let result;
      if (id) {
        result = await ClasseController.update(id, formData);
      } else {
        result = await ClasseController.create(formData);
      }

      if (result.success) {
        toast.success(id ? 'Classe modifié avec succès' : 'Classe ajouté avec succès');
        navigate('/classes');
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
        {id ? 'Modifier la class' : 'Ajouter une classe'}
      </h1>
      <Form
        fields={classeFields}
        onSubmit={handleSubmit}
        initialValues={classe}
        submitLabel={id ? 'Modifier' : 'Ajouter'}
      />
    </div>
  );
};

export default ClasseForm;