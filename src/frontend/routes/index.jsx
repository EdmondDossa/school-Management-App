import React from "react";
import { createHashRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import Dashboard from "../views/Dashboard";
import Etablissement from "../views/Etablissement";
import ElevesList from "../views/Eleves";
import ClassesList from "../views/Classes";
import { EmploiDuTempsList } from "../views/EmploiDuTemps";
import Matieres from "../views/Matieres";
import Professeurs from "../views/Professeurs";
import AnneeScolaire from "../views/Annee-Scolaire";
import ClasseConfiguration from "../views/Classes/classe-configuration";


export const router = createHashRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "etablissements",
        element: <Etablissement />,
      },
      {
        path: "annees-scolaires",
        element: <AnneeScolaire />,
      },
      {
        path: "eleves",
        element: <ElevesList />,
      },
      {
        path: "classes",
        element: <ClassesList />,
      },
      {
        path: "classes/config-class/:id",
        element: <ClasseConfiguration />,
      },
      {
        path: "matieres",
        element: <Matieres />,
      },
      {
        path: "professeurs",
        element: <Professeurs />,
      },
      // {
      //   path: "professeurs/:id",
      //   element: <ClassesTenuesParProfesseur />,
      // },
      {
        path: "emplois-du-temps",
        element: <EmploiDuTempsList />,
      },

      /* {
        path: 'notes',
        element: <NotesList />,
      },
      {
        path: 'bulletin',
        element: <BulletinList />,
      }, */
    ],
  },
]);
