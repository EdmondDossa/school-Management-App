import toast from "react-hot-toast";

function capitalize(sentence){
  let words = sentence.split(" ");
  let result = words.map((word)=> {
      if(word.trim() != ""){
          return word.trim().charAt(0).toUpperCase() + word.trim().slice(1).toLowerCase();
      }; 
  });
  return result.join(" ");
}

function checkAnneeScolaireValidity(datedebut,datefin, anneeScolaire){
  const dateDebut = new Date(datedebut);
  const dateFin = new Date(datefin);
  const annee = anneeScolaire.split("-").map(Number);

  if(annee[1]-annee[0] !== 1){
    return {
      isValid:false,
      message:"Des années consécutives sont requises!"
     };
  }
  
  if(annee[0] !== dateDebut.getFullYear() || annee[1] !== dateFin.getFullYear()){
    return {
      isValid:false,
      message:"L'année scolaire et la durée ne correspondent pas"
     };
  } 
  
  
  if(dateDebut.getTime() > dateFin.getTime()) {
   return {
    isValid:false,
    message:"La date de la fin d'année scolaire doit être supérieure à celle de son début"
   };
  }
  
  //handle conversion of unix timestamps in months
  let offset = Math.floor((dateFin - dateDebut) / 2_678_400_000 ) 
  if(offset <= 7){
    return {
      isValid:false,
      message:"Une rentrée scolaire doit faire au moins 08 mois"
    }
  }

  return { isValid:true, message:""};
}

async function getEtablissement(){
  return await window.electronAPI.store.get("etablissement");
}

async function electronConfirm(message){
  return await window.electronAPI.confirm(message);
}

async function getAnneeScolaire(){
  return await window.electronAPI.store.get("anneeScolaireEncours");
}

function displayAnneeAnterieureToast(annee){
  toast(`Vous consulter l'année ${annee}`, {
    icon:"⌛",
    position:"top-center",
    duration:Infinity,
    style: {
      width:"500px",
      borderRadius: '10px',
      background: '#333',
      color: '#fff',
      whiteSpace:"nowrap"
    },
  });
}
export {
   capitalize ,
   getEtablissement ,
   electronConfirm,
   getAnneeScolaire,
   checkAnneeScolaireValidity,
   displayAnneeAnterieureToast,
  };