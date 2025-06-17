export const professeurFields = [
  { 
    name:"matieres",
    keys:{
      "label":"NomMat",
      "value":"CodMat"
    },
    label:"Matieres Enseignees",
    type:"multiselect",
    placeholder:"Veuillez selectionner les matières",
    noOptionsMessage:"Aucune matiere disponible",
    options:[],
    selectedOptions:[]
   },
  { name: "NomProf", label: "Nom du professeur", type: "text",required:true },
  { name: "PrenomsProf", label: "Prenom du professeur", type: "text",required:true },
  { name: "Sexe", label: "Sexe", type: "select" ,required:true ,
    options: [
      { label: "Masculin", value: "M" },
      { label: "Féminin", value: "F" },
    ] },
  { name: "Adresse", label: "Adresse", type: "text" },
  { name: "Telephone", label: "Telephone", type: "tel" ,required:true  },
  { name: "Email", label: "Email", type: "email"},
  { name: "DateNaissance", label: "Date de naissance", type: "date"  },
  { name: "LieuNaissance", label: "Lieu de naissance", type: "text" },
  { name: "Nationalite", label: "Nationalite", type: "text"  },
];


export const classFields = [
  { name: "NomMat", label: "Nom de la Matière", type: "text",required:true },
];