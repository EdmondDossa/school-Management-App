import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Input } from "../../components";
import EtablissementService from "../../../services/EtablissementService";
import { getResourcesPath, handleUploadFile } from "../../../utils";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/Card";
import { School } from "lucide-react";
import { Button } from "../../components/Bouton";

const Etablissement = () => {
  const [etablissement, setEtablissement] = useState({
    NumEtabli: null,
    NomEtabli: "",
    Adresse: "",
    Telephone: "",
    Email: "",
    Logo: null,
  });

  const resourcePath = "resources/images/etablissements/";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEtablissement({ ...etablissement, [name]: value });
  };

  const handleFileChange = (e) => {
    setEtablissement({ ...etablissement, Logo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let saveFile;
    if (etablissement.Logo?.name) {
      saveFile = await handleUploadFile(
        etablissement.Logo,
        "images/etablissements"
      );
      if (saveFile.success) {
        etablissement.Logo = saveFile.fileName;
      } else {
        toast.error("Le fichier n'a pas pu être enrégistré");
        return;
      }
    }
    if (etablissement.NumEtabli === null) {
      etablissement.NumEtabli = null;
      EtablissementService.createEtablissement(etablissement)
        .then(async (response) => {
          if (response.success) {
            etablissement.NumEtabli = response.data.lastID;
            await window.electronAPI.store.set("etablissement", etablissement);
            setEtablissement({ ...etablissement });
            toast.success("Etablissement créé avec succès");
          } else {
            toast.error("Erreur lors de la création de l'établissement");
          }
        })
        .catch((error) => {
          toast.error("Erreur lors de la création de l'établissement");
        });
    } else {
      EtablissementService.updateEtablissement(etablissement)
        .then(async (response) => {
          if (response.success) {
            await window.electronAPI.store.set("etablissement", etablissement);
            setEtablissement({ ...etablissement });
            toast.success("Etablissement modifié avec succès");
          } else {
            toast.error("Erreur lors de la modification de l'établissement");
          }
        })
        .catch((error) => {
          console.error("Error updating etablissement:", error);
          toast.error("Erreur lors de la modification de l'établissement");
        });
    }
  };

  const getEtablissement = async () => {
    const etablissement = await window.electronAPI.store.get("etablissement");
    setEtablissement({ ...etablissement });
  };
  useEffect(() => {
    getEtablissement();
  }, []);

  return (
    <div className="">
      <main className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <School className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestion de l'Etablissement</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Information de l'Etablissement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                <div className="space-y-4">
                  <label className="text-[15px]">Nom de l’établissement</label>
                  <Input
                    type="text"
                    name="NomEtabli"
                    placeholder="Nom"
                    required
                    value={etablissement.NomEtabli}
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
                    value={etablissement.Adresse}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[15px]">Téléphone</label>
                  <PhoneInput
                    defaultCountry="bj"
                    country={"bj"}
                    value={etablissement.Telephone}
                    placeholder="Téléphone"
                    onChange={(phone) =>
                      setEtablissement({ ...etablissement, Telephone: phone })
                    }
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[15px]">Email</label>
                  <Input
                    type="email"
                    name="Email"
                    placeholder="exemple@gmail.com"
                    value={etablissement.Email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[15px]">Insérer une image</label>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    previewFile={
                      etablissement.Logo != null
                        ? `app://${resourcePath + etablissement.Logo}`
                        : null
                    }
                    className="hidden"
                    id="fileInput"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[15px] invisible">Actions</label>
                  <div className="flex space-x-4 justify-end items-center">
                    <Button type="submit" className="w-1/2 h-[50px]">
                      {etablissement.NumEtabli === null ? "Créer" : "Modifier"}
                    </Button>
                    <Button
                      type="reset"
                      className="w-1/2 h-[50px]"
                      variant={"destructive"}
                      onClick={() =>
                        setEtablissement({
                          NumEtabli: null,
                          NomEtabli: "",
                          Adresse: "",
                          Telephone: "",
                          Email: "",
                          Logo: null,
                        })
                      }
                    >
                      Effacer
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
export default Etablissement;
