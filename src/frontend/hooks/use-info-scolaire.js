import { useEffect,useState } from "react";

export const useInfoScolaire = ()=>{
  const [infoScolaire,setInfoScolaire] = useState({
    Annee:"",
    NumEtabli:""
  });

  async function getInfoScolaire(){
    const { NumEtabli } = await window.electronAPI.store.get("etablissement");
    const { Annee } = await window.electronAPI.store.get("anneeScolaireEncours");
    setInfoScolaire({NumEtabli,Annee});
  }

  useEffect(()=>{
    getInfoScolaire();
  },[]);
  return infoScolaire;
} 