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
    Annee: null,
    DateDebut: null,
    DateFin: null,
    Periodicite: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllAnneesScolaires = async () => {
    setIsLoading(true);
    const response = await AnneeScolaireService.getAllAnneesScolaires();
    if (response.success) {
      setAnneeScolaires(response.data);
    } else {
      toast.error("Erreur lors de la récupération des années scolaires");
    }
    setIsLoading(false);
  };
  useEffect(() => {
    fetchAllAnneesScolaires();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
  };
  return (
    <div className="">
      <main className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <CalendarDays className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestion de l'année scolaire</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration de l'année scolaire</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="annee">Année scolaire</Label>
                  <Input id="annee" placeholder="Ex: 2024-2025" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateDebut">Date de début</Label>
                  <Input id="dateDebut" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFin">Date de fin</Label>
                  <Input id="dateFin" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodicite">Périodicité</Label>
                  <Input id="periodicite" placeholder="Semestre/Trimestre" />
                </div>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-1/2 bg-blue-600 text-white rounded-md h-[50px]"
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
