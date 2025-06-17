import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { detectPeriodeActuelle } from "../../../utils";
import toast from "react-hot-toast";
import { displayAnneeAnterieureToast } from "../../utils";

import {
  AnneeScolaireService,
  ClasseService,
  EtablissementService,
  PeriodeService,
  InscriptionService,
  ProfesseurService,
} from "../../../services";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/Card";

import {
  CalendarDays,
  GraduationCap,
  School,
  Speech,
  Users,
} from "lucide-react";

const Dashboard = () => {
  const [etablissement, setEtablissement] = useState(null);
  const [nombreEleves, setNombreEleves] = useState(0);
  const [nombreClasses, setNombreClasses] = useState(0);
  const [nombreProfesseurs, setNombreProfesseurs] = useState(0);

  const loadDefaultAppData = async () => {
    const etablissements = await EtablissementService.getAllEtablissements();
    const periodes = await PeriodeService.getAllPeriodes();
    await window.electronAPI.store.set("etablissements", etablissements);
    await window.electronAPI.store.set("periodes", periodes);
    let anneeScolaires = [];

    if (etablissements.length > 0) {
      const etablissement = etablissements[0];
      setEtablissement(etablissement);
      await window.electronAPI.store.set("etablissement", { ...etablissement });

      const res = await AnneeScolaireService.getAllAnneesScolaires(
        etablissement.NumEtabli
      );
      anneeScolaires = res.data;
      const classes = await ClasseService.getAllClasses(
        etablissement.NumEtabli
      );
      setNombreClasses(classes.length);

      const professeurs = await ProfesseurService.getAllProfesseurs(
        etablissement.NumEtabli
      );
      setNombreProfesseurs(professeurs.length);
    } else {
      await window.electronAPI.store.set("etablissement", {
        NumEtabli: null,
        NomEtabli: "",
        Adresse: "",
        Telephone: "",
        Email: "",
        Logo: null,
      });
    }

    if (anneeScolaires.length > 0) {
      const anneeScolaire = await AnneeScolaireService.getLastAnneeScolaire();
      const localAnneeScolaire = await window.electronAPI.store.get(
        "anneeScolaireEncours"
      );
      //before to update the date in the local storage we must check first if it is not a state of old annee preview
      if (localAnneeScolaire?.Statut !== "Termine") {
        //if the last saved annee scolaire is already ended no need to update the local storage
        if (anneeScolaire.Statut === "EnCours") {
          await window.electronAPI.store.set("anneeScolaireEncours", {
            ...anneeScolaire,
          });
        }
      } else {
        toast.dismiss();
        //now notice to the user that it is a preview state
        displayAnneeAnterieureToast(localAnneeScolaire.Annee);
      }

      const nombreInscriptionsEnCours =
        await InscriptionService.getInscriptionByAnneeScolaire(
          anneeScolaire.id
        );
      if (nombreInscriptionsEnCours?.length > 0)
        setNombreEleves(nombreInscriptionsEnCours.length);

      await window.electronAPI.store.set("anneeScolaires", anneeScolaires);
      const periode = await detectPeriodeActuelle();
      await window.electronAPI.store.set("periodeEncours", periode);
    } else {
      await window.electronAPI.store.set("anneeScolaireEncours", {
        Annee: null,
        DateDebut: null,
        DateFin: null,
        Periodicite: null,
      });
      await window.electronAPI.store.set("periodeEncours", {});
      await window.electronAPI.store.set("anneeScolaires", []);
    }

    if (periodes.length > 0) {
      await window.electronAPI.store.set("periodes", periodes);
    } else {
      await window.electronAPI.store.set("periodes", []);
    }
  };

  useEffect(() => {
    loadDefaultAppData();
  }, []);

  return (
    <main className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-8'>Tableau de bord</h1>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Établissement</CardTitle>
            <School className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {!etablissement && (
              <div className='text-sm text-muted-foreground'>Non configuré</div>
            )}
            {etablissement && (
              <div className='text-sm text-muted-foreground'>
                <b>Nom: </b> {etablissement.NomEtabli} <br />
                <b>Adresse: </b> {etablissement.Adresse} <br />
                <b>Telephone: </b> {etablissement.Telephone} <br />
                <b>Email: </b> {etablissement.Email} <br />
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Élèves</CardTitle>
            <GraduationCap className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'> {nombreEleves}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Classes</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{nombreClasses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Professeurs</CardTitle>
            <Speech className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{nombreProfesseurs}</div>
          </CardContent>
        </Card>
      </div>

      <div className='mt-8'>
        <h2 className='text-xl font-semibold mb-4'>Actions rapides</h2>
        <div className='flex flex-wrap gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Link to='/etablissements'>
            <Card className='cursor-pointer hover:bg-gray-50 transition-colors'>
              <CardHeader className='flex flex-row items-center gap-4'>
                <School className='h-5 w-5 text-primary' />
                <CardTitle className='text-sm'>
                  Configurer l'établissement
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
          <Link to='/classes'>
            <Card className='cursor-pointer hover:bg-gray-50 transition-colors'>
              <CardHeader className='flex flex-row items-center gap-4'>
                <Users className='h-5 w-5 text-primary' />
                <CardTitle className='text-sm'>Ajouter une classe</CardTitle>
              </CardHeader>
            </Card>
          </Link>
          <Link to='/eleves'>
            <Card className='cursor-pointer hover:bg-gray-50 transition-colors'>
              <CardHeader className='flex flex-row items-center gap-4'>
                <GraduationCap className='h-5 w-5 text-primary' />
                <CardTitle className='text-sm'>Inscrire un élève</CardTitle>
              </CardHeader>
            </Card>
          </Link>
          <Link to='/annees-scolaires'>
            <Card className='cursor-pointer hover:bg-gray-50 transition-colors'>
              <CardHeader className='flex flex-row items-center gap-4'>
                <CalendarDays className='h-5 w-5 text-primary' />
                <CardTitle className='text-sm'>
                  Gérer l'année scolaire
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
