import { useEffect,useState } from "react";

export const useInfoScolaire = ()=>{
  const [infoScolaire,setInfoScolaire] = useState({
    Annee:"",
  });

  async function getInfoScolaire(){
    const { Annee } = await window.electronAPI.store.get("anneeScolaireEncours");
    setInfoScolaire({Annee});
  }

  useEffect(()=>{
    getInfoScolaire();
  },[]);
  return infoScolaire;
}
 