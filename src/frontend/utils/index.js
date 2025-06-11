function capitalize(sentence){
  let words = sentence.split(" ");
  let result = words.map((word)=> {
      if(word.trim() != ""){
          return word.trim().charAt(0).toUpperCase() + word.trim().slice(1).toLowerCase();
      }; 
  });
  return result.join(" ");
}

function checkAnneeScolaireValidity(datedebut,datefin){
  const dateDebut = new Date(datedebut);
  const dateFin = new Date(datefin);
  
  if(dateDebut.getTime() > dateFin.getTime()) {
   return {
    isValid:false,
    message:"La date de la fin d'année scolaire doit être supérieure à celle de son début"
   };
  }

  let moisDebut = dateDebut.getMonth() + 1;
  let moisFin = dateDebut.getMonth() + 1 ;

  if(moisFin - moisDebut <= 6){
    return {
      isValid:false,
      message:"Une rentrée scolaire doit faire au moins 07 mois"
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

export {
   capitalize ,
   getEtablissement ,
   electronConfirm,
   getAnneeScolaire,
   checkAnneeScolaireValidity
  };