import React from "react";
import { createHashRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import Dashboard from "../views/Dashboard";
import Etablissement from "../views/Etablissement";
import ElevesList from "../views/Eleves";
import ClassesList from "../views/Classes";
import EmploiDuTemps from "../views/EmploiDuTemps";
import Matieres from "../views/Matieres";
import Professeurs from "../views/Professeurs";
import AnneeScolaire from "../views/Annee-Scolaire";
import ClasseConfiguration from "../views/Classes/classe-configuration";
import NotesPanel from "../views/Notes";
import Bulletins from "../views/Bulletins";
import Connexion from "../views/Connexion";
import Inscription from "../views/Inscription";
import ChangePassword from "../views/ChangePassword";
import ProtectedRoute from "./ProtectedRoute";

export const router = createHashRouter([
  {
    path: "/connexion",
    element: <Connexion />,
  },
  {
    path: "/inscription",
    element: <Inscription />,
  },
  {
    path: "/settings/change-password",
    element: <ChangePassword />,
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        element: <ProtectedRoute />,
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
            path: "classes/notes/:numClass",
            element: <NotesPanel />,
          },
          {
            path: "classes/bulletins/:NumIns",
            element: <Bulletins />,
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
            element: <EmploiDuTemps />,
          },

          /*
      {
        path: 'bulletin',
        element: <BulletinList />,
      }, */
        ],
      },
    ],
  },
]);
