import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Input, Label } from "../../components";
import { Button } from "../../components/Bouton.jsx";
import { AnneeScolaireService } from "../../../services";
import toast from "react-hot-toast";
import Modal from "../../components";

import {
  checkAnneeScolaireValidity,
  electronConfirm,
  getEtablissement,
} from "../../utils/";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/Card";

const AnneeScolaire = () => {
  const initialValues = {
    Annee: "",
    DateDebut: "",
    DateFin: "",
    Periodicite: "",
  };

  const [AnneeScolaire, setAnneeScolaire] = useState(initialValues);
  const [anneeScolaireEncours, setAnneeScolaireEnCours] = useState({});
  const isAnneeEnCours = anneeScolaireEncours.Statut === "EnCours";

  const [openModal, setOpenModal] = useState(false);
  const [confirmAnnee, setConfirmAnnee] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setAnneeScolaire({ ...AnneeScolaire, [name]: value });
  }

  async function fetchAnneeScolaireEnCours() {
    const currentAnnee = await AnneeScolaireService.getLastAnneeScolaire();
    setAnneeScolaireEnCours(currentAnnee);
  }

  async function handleAnneeAchievement(e) {
    e.preventDefault();
    if(confirmAnnee === anneeScolaireEncours.Annee) {
      const result = await AnneeScolaireService.setAnneeScolaireAsTerminee(
        anneeScolaireEncours.id
      );
      if(result.success){
        toast.success("Année scolaire marquée comme terminée");
        fetchAnneeScolaireEnCours();
      }else{
        toast.error("Une erreur est survenue");
      }
    }else{
      toast.error("Les valeurs ne correspondent pas!");
    }
    setOpenModal(false);
  }

  async function marqueeAnneeScolaireAsTerminee() {
    const confirmMessage = await electronConfirm(
      `Êtes-vous sûr de vouloir marquée l'année ${anneeScolaireEncours.Annee} comme terminée?Cette action est irréversible.`
    );
    if (confirmMessage) {
      setOpenModal(true);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!["Semestre", "Trimestre"].includes(AnneeScolaire.Periodicite)) {
      return toast.error(
        `${AnneeScolaire.Periodicite} n'est pas une période valide!`
      );
    }

    const { isValid: isAnneeScolaireValid, message } =
      checkAnneeScolaireValidity(
        AnneeScolaire.DateDebut,
        AnneeScolaire.DateFin
      );

    if (!isAnneeScolaireValid) {
      return toast.error(message);
    }

    const { NumEtabli } = await getEtablissement("etablissement");
    await AnneeScolaireService.createAnneeScolaire({
      ...AnneeScolaire,
      NumEtabli,
    });
    await window.electronAPI.store.set("anneeScolaireEncours", {
      ...AnneeScolaire,
      NumEtabli,
    });
    toast.success("Annee Scolaire Créee!");
    setAnneeScolaire(initialValues);
  }

  useEffect(() => {
    fetchAnneeScolaireEnCours();
  }, []);

  return (
    <div>
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
                    value={
                      isAnneeEnCours
                        ? anneeScolaireEncours.Annee
                        : AnneeScolaire.Annee
                    }
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
                    value={
                      isAnneeEnCours
                        ? anneeScolaireEncours.DateDebut
                        : AnneeScolaire.DateDebut
                    }
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='dateFin'>Date de fin</Label>
                  <Input
                    id='dateFin'
                    type='date'
                    name='DateFin'
                    value={
                      isAnneeEnCours
                        ? anneeScolaireEncours.DateFin
                        : AnneeScolaire.DateFin
                    }
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
                    value={
                      isAnneeEnCours
                        ? anneeScolaireEncours.Periodicite
                        : AnneeScolaire.Periodicite
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Button
                  type='submit'
                  size='lg'
                  disable={isAnneeEnCours}
                  className='w-1/2 bg-blue-600 text-white rounded-md h-[50px] disabled:cursor-not-allowed'
                >
                  Enregistrer l'année scolaire
                </Button>
                {isAnneeEnCours && (
                  <Button
                    type='reset'
                    size='lg'
                    disable={isAnneeEnCours}
                    onClick={marqueeAnneeScolaireAsTerminee}
                    className='w-1/2 bg-red-500 text-white rounded-md h-[50px] disabled:cursor-not-allowed'
                  >
                    Marquer l'année en cours comme terminé
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Modal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
        }}
        title={`Confirmer la suppression de l'année ${anneeScolaireEncours.Annee}`}
      >
        <form onSubmit={handleAnneeAchievement}>
          <div>
            <Label>
              {" "}
              Saisissez {anneeScolaireEncours.Annee} dans ce champ{" "}
            </Label>
            <input
              type='text'
              onChange={(e) => setConfirmAnnee(e.target.value)}
              value={confirmAnnee}
            />
          </div>
          <Button className='bg-red-700 text-white'>Lancer la suppression</Button>
        </form>
      </Modal>
    </div>
  );
};

export default AnneeScolaire;
