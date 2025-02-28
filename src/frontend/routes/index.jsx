import React from 'react';
import { createHashRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import Dashboard from '../views/Dashboard';
import { StudentsList, StudentForm } from '../views/Students';
import { ClassesList, ClasseForm } from '../views/Classes';

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
        path: 'students',
        element: <StudentsList />,
      },
      {
        path: 'students/add',
        element: <StudentForm />,
      },
      {
        path: 'students/edit/:id',
        element: <StudentForm />,
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
    ],
  },
]);