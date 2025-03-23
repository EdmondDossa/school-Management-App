import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {Input, Button} from "../../components";

const Etablissement = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    fichier: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, fichier: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Données envoyées :", formData);
  };

  return (
    <div className="flex justify-center items-center">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <label className="text-[15px]">Nom  de l’établissement</label>
          <Input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-4">
          <label className="text-[15px]">Adresse</label>
          <Input
            type="text"
            name="adresse"
            placeholder="adresse"
            value={formData.adresse}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-4">
          <label className="text-[15px]">Téléphone</label>
          <PhoneInput
            defaultCountry="bj"
            country={"bj"}
            value={formData.telephone}
            onChange={(phone) => setFormData({ ...formData, telephone: phone })}
          />
        </div>
        <div className="space-y-4">
          <label className="text-[15px]">Email</label>
          <Input
            type="email"
            name="email"
            placeholder="exemple@gmail.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-4"> 
          <label className="text-[15px]">Insérer une image</label>
          <Input
            type="file"
            onChange={handleFileChange}
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
              Enregistrer
            </Button>
            <Button
              type="reset"
              onClick={() => setFormData({ nom: "", prenom: "", telephone: "", email: "", fichier: null })}
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
