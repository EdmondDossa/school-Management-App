function capitalize(sentence){
  let words = sentence.split(" ");
  let result = words.map((word)=> {
      if(word.trim() != ""){
          return word.trim().charAt(0).toUpperCase() + word.trim().slice(1).toLowerCase();
      }; 
  });
  return result.join(" ");
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
   getAnneeScolaire
  };