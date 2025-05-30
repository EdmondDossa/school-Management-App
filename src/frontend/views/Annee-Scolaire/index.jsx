import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Input, Label } from "../../components";
import { Button } from "../../components/Bouton.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/Card";
import { AnneeScolaireService } from "../../../services";
import toast from "react-hot-toast";

const AnneeScolaire = () => {
  const [AnneeScolaires, setAnneeScolaires] = useState([]);
  const [AnneeScolaire, setAnneeScolaire] = useState({
    Annee: "",
    DateDebut: "",
    DateFin: "",
    Periodicite: "",
  });

  const fetchAllAnneesScolaires = async () => {
    const response = await window.electronAPI.store.get("anneeScolaires");
    setAnneeScolaires(response);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnneeScolaire({ ...AnneeScolaire, [name]: value });
  };

  useEffect(() => {
    fetchAllAnneesScolaires();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!["Semestre","Trimestre"].includes(AnneeScolaire.Periodicite)){
      return toast.error(`${AnneeScolaire.Periodicite} n'est pas une période valide!`);
    }
    const { NumEtabli } =  await window.electronAPI.store.get("etablissement");
    await AnneeScolaireService.createAnneeScolaire({ ...AnneeScolaire,NumEtabli });
    await window.electronAPI.store.set("anneeScolaireEncours", { ...AnneeScolaire,NumEtabli });
    toast.success("Annee Scolaire Créee!");
    setAnneeScolaire({
      Annee: "",
      DateDebut: "",
      DateFin: "",
      Periodicite: "",
    });    
  };

  return (
    <div className=''>
      <main className='container mx-auto py-8'>
        <div className='flex items-center gap-4 mb-8'>
          <CalendarDays className='h-8 w-8 text-primary' />
          <h1 className='text-3xl font-bold'>Gestion de l'année scolaire</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration de l'année scolaire</CardTitle>
          </CardHeader>
          <CardContent>
            <form className='space-y-6' onSubmit={handleSubmit}>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='annee'>Année scolaire</Label>
                  <Input
                    id='annee'
                    name='Annee'
                    placeholder='Ex: 2024-2025'
                    onChange={handleChange}
                    value={AnneeScolaire.Annee}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='dateDebut'>Date de début</Label>
                  <Input 
                    id='dateDebut' 
                    name='DateDebut'
                    type='date' 
                    onChange={handleChange} 
                    value={AnneeScolaire.DateDebut}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='dateFin'>Date de fin</Label>
                  <Input 
                    id='dateFin' 
                    type='date' 
                    name='DateFin'
                    value={AnneeScolaire.DateFin}
                    onChange={handleChange} 
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='periodicite'>Périodicité</Label>
                  <Input
                    id='periodicite'
                    name='Periodicite'
                    placeholder='Semestre/Trimestre'
                    onChange={handleChange}
                    value={AnneeScolaire.Periodicite}
                    required
                  />
                </div>
              </div>
              <Button
                type='submit'
                size='lg'
                className='w-1/2 bg-blue-600 text-white rounded-md h-[50px]'
              >
                Enregistrer l'année scolaire
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AnneeScolaire;
