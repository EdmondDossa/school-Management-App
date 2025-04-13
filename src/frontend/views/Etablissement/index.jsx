import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {Input, Button} from "../../components";
import EtablissementService from "../../../services/EtablissementService";
import { getResourcesPath, handleUploadFile } from "../../../utils";
import toast from "react-hot-toast";

const Etablissement = () => {
  const [formData, setFormData] = useState({
    NumEtabli: null,    
    NomEtabli: "",
    Adresse: "",
    Telephone: "",
    Email: "",
    Logo: null,
  });

  const resourcePath = 'resources/images/etablissements/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, Logo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let saveFile;
    if(formData.Logo.name) {
      saveFile = await handleUploadFile(formData.Logo, "images/etablissements");
      if(saveFile.success){
        formData.Logo = saveFile.fileName;
      }else{
        toast.error("Le fichier n'a pas pu être enrégistré");
        return;
      }
    }      
    if(formData.NumEtabli === null){
      formData.NumEtabli = null;
      EtablissementService.createEtablissement(formData)
      .then((response) => {
        if(response.success){
          formData.NumEtabli = response.data.insertId;
          toast.success("Etablissement créé avec succès");
        }else{
          toast.error("Erreur lors de la création de l'établissement");
        }
      })
      .catch((error) => {
        toast.error("Erreur lors de la création de l'établissement");
      });
    }else{
      EtablissementService.updateEtablissement(formData)
        .then((response) => {
          if(response.success){
            toast.success("Etablissement modifié avec succès");
          }else{
            toast.error("Erreur lors de la modification de l'établissement");
          }
        })
        .catch((error) => {
          console.error("Error updating etablissement:", error);
          toast.error("Erreur lors de la modification de l'établissement");
        });
    }
  };

  useEffect(() => {
    EtablissementService.getAllEtablissements()
      .then((response) => {
        const data = response.data;
        if (data.length > 0) {
          const etablissement = data[0];
          setFormData({
            NumEtabli: etablissement.NumEtabli,
            NomEtabli: etablissement.NomEtabli,
            Adresse: etablissement.Adresse,
            Telephone: etablissement.Telephone,
            Email: etablissement.Email,
            Logo: etablissement.Logo,
          });
        }else{
          setFormData({
            NumEtabli: null,
            NomEtabli: "",
            Adresse: "",
            Telephone: "",
            Email: "",
            Logo: null,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching etablissements:", error);
      });
      
  }, [])

  return (
    <div className="flex justify-center items-center">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <label className="text-[15px]">Nom  de l’établissement</label>
          <Input
            type="text"
            name="NomEtabli"
            placeholder="Nom"
            required
            value={formData.NomEtabli}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-4">
          <label className="text-[15px]">Adresse</label>
          <Input
            type="text"
            name="Adresse"
            placeholder="Adresse"
            required
            value={formData.Adresse}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-4">
          <label className="text-[15px]">Téléphone</label>
          <PhoneInput
            defaultCountry="bj"
            country={"bj"}
            value={formData.Telephone}
            placeholder="Téléphone"
            onChange={(phone) => setFormData({ ...formData, Telephone: phone })}
          />
        </div>
        <div className="space-y-4">
          <label className="text-[15px]">Email</label>
          <Input
            type="email"
            name="Email"
            placeholder="exemple@gmail.com"
            value={formData.Email}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-4"> 
          <label className="text-[15px]">Insérer une image</label>
          <Input
            type="file"
            onChange={handleFileChange}
            previewFile={formData.Logo != null ? `app://${resourcePath + formData.Logo}` : null}
            className="hidden"
            id="fileInput"            
          />
        </div>
        <div className="space-y-4"> 
          <label className="text-[15px] invisible">Actions</label>
          <div className="flex space-x-4 justify-end items-center">
            <Button 
              type="submit" 
              className="w-1/2 bg-blue-600 text-white rounded-md h-[50px]"
            >
              { formData.NumEtabli === null ? "Créer" : "Modifier" }
            </Button>
            <Button
              type="reset"
              onClick={() => setFormData({
                NumEtabli: null,
                NomEtabli: "",
                Adresse: "",
                Telephone: "",
                Email: "",
                Logo: null,
              })}
              className="w-1/2 h-[50px] py-3 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-100"
            >
              Effacer
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default Etablissement;
