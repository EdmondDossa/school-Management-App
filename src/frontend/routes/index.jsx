import React from 'react';
import { createHashRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import Dashboard from '../views/Dashboard';
import Etablissement from '../views/Etablissement';
import { ElevesList, EleveForm } from '../views/Eleves';
import { ClassesList, ClasseForm } from '../views/Classes';
import { EmploiDuTempsList } from '../views/EmploiDuTemps';
import Matieres from '../views/Matieres';
import Professeurs from '../views/Professeurs';

export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'etablissements',
        element: <Etablissement />,
      },
      {
        path: 'eleves',
        element: <ElevesList />,
      },
      {
        path: 'eleves/add',
        element: <EleveForm />,
      },
      {
        path: 'eleves/edit/:id',
        element: <EleveForm />,
      },
      {
        path: 'classes',
        element: <ClassesList />,
      },
      {
        path: 'classes/add',
        element: <ClasseForm />,
      },
      {
        path: 'classes/edit/:id',
        element: <ClasseForm />,
      },
      {
        path: 'matieres',
        element: <Matieres />,
      },
      {
        path: 'professeurs',
        element: <Professeurs />,
      },
      {
        path: 'emplois-du-temps',
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