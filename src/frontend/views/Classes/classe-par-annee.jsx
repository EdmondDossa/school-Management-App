import React, { useState, useEffect } from "react";
import axios from "axios";

const ClasseParAnnee = ({ anneeScolaireId, classeId }) => {
  const [eleves, setEleves] = useState([]);
  const [elevesDisponibles, setElevesDisponibles] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [nouvelEleveId, setNouvelEleveId] = useState("");
  const [nouvelleMatiere, setNouvelleMatiere] = useState("");

  useEffect(() => {
    // Charger les élèves de la classe
    axios
      .get(`/api/classes/${classeId}/annee-scolaire/${anneeScolaireId}/eleves`)
      .then((response) => setEleves(response.data))
      .catch((error) => console.error(error));

    // Charger les élèves disponibles
    axios
      .get(`/api/eleves/disponibles?anneeScolaireId=${anneeScolaireId}`)
      .then((response) => setElevesDisponibles(response.data))
      .catch((error) => console.error(error));

    // Charger les matières de la classe
    axios
      .get(`/api/classes/${classeId}/matieres`)
      .then((response) => setMatieres(response.data))
      .catch((error) => console.error(error));
  }, [anneeScolaireId, classeId]);

  const ajouterEleve = () => {
    if (!nouvelEleveId) return;

    axios
      .post(`/api/classes/${classeId}/ajouter-eleve`, {
        eleveId: nouvelEleveId,
        anneeScolaireId,
      })
      .then(() => {
        setEleves((prev) => [
          ...prev,
          elevesDisponibles.find((eleve) => eleve.id === nouvelEleveId),
        ]);
        setElevesDisponibles((prev) =>
          prev.filter((eleve) => eleve.id !== nouvelEleveId)
        );
        setNouvelEleveId("");
      })
      .catch((error) => console.error(error));
  };

  const assignerMatiere = () => {
    if (!nouvelleMatiere) return;

    axios
      .post(`/api/classes/${classeId}/assigner-matiere`, {
        matiere: nouvelleMatiere,
      })
      .then(() => {
        setMatieres((prev) => [...prev, nouvelleMatiere]);
        setNouvelleMatiere("");
      })
      .catch((error) => console.error(error));
  };

  return (
    <div>
      <h1>Gestion de la classe pour l'année scolaire</h1>

      <h2>Liste des élèves</h2>
      <ul>
        {eleves.map((eleve) => (
          <li key={eleve.id}>{eleve.nom}</li>
        ))}
      </ul>

      <h3>Ajouter un élève</h3>
      <select
        value={nouvelEleveId}
        onChange={(e) => setNouvelEleveId(e.target.value)}
      >
        <option value="">Sélectionner un élève</option>
        {elevesDisponibles.map((eleve) => (
          <option key={eleve.id} value={eleve.id}>
            {eleve.nom}
          </option>
        ))}
      </select>
      <button onClick={ajouterEleve}>Ajouter</button>

      <h2>Matières assignées</h2>
      <ul>
        {matieres.map((matiere, index) => (
          <li key={index}>{matiere}</li>
        ))}
      </ul>

      <h3>Assigner une matière</h3>
      <input
        type="text"
        value={nouvelleMatiere}
        onChange={(e) => setNouvelleMatiere(e.target.value)}
        placeholder="Nom de la matière"
      />
      <button onClick={assignerMatiere}>Assigner</button>
    </div>
  );
};

export default ClasseParAnnee;
