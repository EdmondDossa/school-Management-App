import React, { useEffect } from "react";
import DashboardCard from "../../components/DashboardCard";
import {
  AnneeScolaireService,
  EtablissementService,
  PeriodeService,
} from "../../../services";

const Dashboard = () => {
  const loadDefaultAppData = async () => {
    const etablissements = await EtablissementService.getAllEtablissements();
    const anneeScolaires = await AnneeScolaireService.getAllAnneesScolaires();
    const periodes = await PeriodeService.getAllPeriodes();

    await window.electronAPI.store.set("etablissements", etablissements);
    await window.electronAPI.store.set("anneeScolaires", anneeScolaires);
    await window.electronAPI.store.set("periodes", periodes);

    if (etablissements.length > 0) {
      const etablissement = etablissements[0];
      await window.electronAPI.store.set("etablissement", { ...etablissement });
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
      const anneeScolaire = anneeScolaires[anneeScolaires.length - 1];
      await window.electronAPI.store.set("anneeScolaireEncours", {
        ...anneeScolaire,
      });
      await window.electronAPI.store.set("anneeScolaires", anneeScolaires);
      const periode = await detectPeriodeActuelle(anneeScolaire);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DashboardCard
        title="Étudiants"
        description="Gérez les informations des étudiants"
        link="/students"
      />
      <DashboardCard
        title="Classes"
        description="Gérez les classes et les affectations"
        link="/classes"
      />
      <DashboardCard
        title="Emplois du temps"
        description="Consultez et modifiez les emplois du temps"
        link="/schedule"
      />
    </div>
  );
};

export default Dashboard;
