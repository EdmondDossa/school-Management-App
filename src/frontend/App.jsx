import React, { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import {
  AnneeScolaireService,
  EtablissementService,
  PeriodeService,
} from "../services";

const App = () => {
  useEffect(() => {}, []);
  return <RouterProvider router={router} />;
};

export default App;
