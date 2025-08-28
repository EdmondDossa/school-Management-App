import React, { useState } from "react";
import Input from "../../components/Input";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../../services";
import Logo from "../../assets/icons/school-manager-logo.svg";
import AppBar from "../../components/AppBar";

function Inscription() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await AuthService.createUser({ username: "user", password });
    if (result) {
      await window.electronAPI.store.set("loggedIn", true);
      navigate("/");
    } else {
      alert("Erreur lors de la création de l'utilisateur");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppBar />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl text-center transition-all duration-500">
          <img src={Logo} alt="Logo" className="w-20 h-20 mx-auto" />
          <h1 className="text-2xl font-bold text-center">Bienvenue !</h1>
          <p className="text-center text-gray-600">
            Pour commencer, veuillez créer un mot de passe.
          </p>
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm outline-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 outline-none focus:outline-none outline-none focus:ring-2 outline-none focus:ring-offset-2 outline-none focus:ring-indigo-500"
            >
              S'inscrire
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Inscription;
