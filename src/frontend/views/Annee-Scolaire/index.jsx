import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Input, Label, Select } from "../../components";
import { Button } from "../../components/Bouton.jsx";
import { AnneeScolaireService } from "../../../services";
import toast from "react-hot-toast";
import { Modal } from "../../components";
import AnneeScolaireAnterieures from "./components/Annee-Scolaire-Anterieure.jsx";

import { checkAnneeScolaireValidity, electronConfirm } from "../../utils/";

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

  const [isAnneeUpdate, setAnneeUpdate] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setAnneeScolaire({ ...AnneeScolaire, [name]: value });
  }

  const handleChangePeriodicite = (option) => {
    setAnneeScolaire({ ...AnneeScolaire, Periodicite: option.value });
  };

  async function fetchAnneeScolaireEnCours() {
    const currentAnnee = await AnneeScolaireService.getLastAnneeScolaire();
    setAnneeScolaireEnCours(
      currentAnnee.Statut === "EnCours" ? currentAnnee : {}
    );
  }

  async function handleAnneeAchievement(e) {
    e.preventDefault();
    if (confirmAnnee === anneeScolaireEncours.Annee) {
      const result = await AnneeScolaireService.setAnneeScolaireAsTerminee(
        anneeScolaireEncours.id
      );
      if (result.success) {
        toast.dismiss();
        toast.success("Année scolaire marquée comme terminée");
        await window.electronAPI.store.set("anneeScolaireEncours", {});
        fetchAnneeScolaireEnCours();
        setAnneeUpdate((prev) => !prev);
      } else {
        toast.error("Une erreur est survenue");
      }
    } else {
      toast.error("Les valeurs ne correspondent pas!");
    }
    setConfirmAnnee("");
    setOpenModal(false);
  }

  async function marqueeAnneeScolaireAsTerminee() {
    const confirmMessage = await electronConfirm(
      `Êtes-vous sûr de vouloir marquée l'année scolaire ${anneeScolaireEncours.Annee} comme terminée? Cette action est irréversible.`
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
        AnneeScolaire.DateFin,
        AnneeScolaire.Annee
      );

    if (!isAnneeScolaireValid) {
      return toast.error(message);
    }
    await AnneeScolaireService.createAnneeScolaire({
      ...AnneeScolaire,
    });
    await window.electronAPI.store.set("anneeScolaireEncours", {
      ...AnneeScolaire,
    });
    toast.dismiss();
    toast.success("Annee Scolaire Créee!");
    fetchAnneeScolaireEnCours();
    setAnneeScolaire(initialValues);
    setAnneeUpdate((prev) => !prev);
  }

  useEffect(() => {
    fetchAnneeScolaireEnCours();
  }, []);

  return (
    <div>
      <main className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <CalendarDays className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestion de l'année scolaire</h1>
        </div>

        <AnneeScolaireAnterieures isAnneeUpdate={isAnneeUpdate} />

        <Card>
          <CardHeader>
            <CardTitle>Configuration de l'année scolaire</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="annee">Année scolaire</Label>
                  <Input
                    id="annee"
                    name="Annee"
                    placeholder="Ex: 2024-2025"
                    readOnly={isAnneeEnCours}
                    onChange={handleChange}
                    value={
                      isAnneeEnCours
                        ? anneeScolaireEncours.Annee
                        : AnneeScolaire.Annee
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodicite">Périodicité</Label>
                  <Select
                    id="periodicite"
                    name="Periodicite"
                    placeholder="Semestre/Trimestre"
                    readOnly={isAnneeEnCours}
                    onChange={handleChangePeriodicite}
                    value={
                      isAnneeEnCours
                        ? anneeScolaireEncours.Periodicite
                        : AnneeScolaire.Periodicite
                    }
                    required
                    options={[
                      { value: "Semestre", label: "Semestre" },
                      { value: "Trimestre", label: "Trimestre" },
                    ]}
                    variant="primary"
                    size="md"
                    triggerClassName="h-[50px] flex items-center justify-between"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateDebut">Date de début</Label>
                  <Input
                    id="dateDebut"
                    name="DateDebut"
                    type="date"
                    readOnly={isAnneeEnCours}
                    onChange={handleChange}
                    value={
                      isAnneeEnCours
                        ? anneeScolaireEncours.DateDebut
                        : AnneeScolaire.DateDebut
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFin">Date de fin</Label>
                  <Input
                    id="dateFin"
                    type="date"
                    name="DateFin"
                    readOnly={isAnneeEnCours}
                    value={
                      isAnneeEnCours
                        ? anneeScolaireEncours.DateFin
                        : AnneeScolaire.DateFin
                    }
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between gap-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isAnneeEnCours}
                  className="w-1/2 bg-blue-600 text-white rounded-md h-[50px]"
                >
                  Enregistrer l'année scolaire
                </Button>
                {isAnneeEnCours && (
                  <Button
                    type="reset"
                    size="lg"
                    onClick={marqueeAnneeScolaireAsTerminee}
                    className="
                    bg-red-600
                    text-white 
                      rounded-mds
                      h-[50px] 
                      w-1/2
                    hover:bg-red-500
                    "
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
        title={`Confirmer la fin de l'année ${anneeScolaireEncours.Annee}`}
      >
        <form onSubmit={handleAnneeAchievement}>
          <div>
            <Label>Saisissez {anneeScolaireEncours.Annee} dans ce champ</Label>
            <Input
              type="text"
              onChange={(e) => setConfirmAnnee(e.target.value)}
              value={confirmAnnee}
              className="my-5"
              required={true}
              autofocus={true}
            />
          </div>
          <Button className="bg-red-700 text-white hover:bg-red-600">
            Confirmer
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default AnneeScolaire;
