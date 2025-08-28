import Input from "../../components/Input";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../../services";
import Logo from "../../assets/icons/school-manager-logo.svg";
import AppBar from "../../components/AppBar";

function Connexion() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutEndsAt, setLockoutEndsAt] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [systemPasswordRequired, setSystemPasswordRequired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (isLockedOut && lockoutEndsAt > Date.now()) {
      timer = setInterval(() => {
        const newRemainingTime = lockoutEndsAt - Date.now();
        if (newRemainingTime <= 0) {
          clearInterval(timer);
          setIsLockedOut(false);
          setRemainingTime(0);
          setError(""); // Clear error message when lockout ends
        } else {
          setRemainingTime(newRemainingTime);
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isLockedOut, lockoutEndsAt]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLockedOut(false);
    setSystemPasswordRequired(false);

    const result = await AuthService.verifyUser({ username: "user", password });

    if (result.success) {
      await window.electronAPI.store.set("loggedIn", true);
      navigate("/");
    } else {
      if (result.isLockedOut) {
        setIsLockedOut(true);
        setLockoutEndsAt(result.lockoutEndsAt);
        setRemainingTime(result.lockoutEndsAt - Date.now());
        setError(result.message);
      } else if (result.systemPasswordRequired) {
        setSystemPasswordRequired(true);
        setError(result.message);
        // Simulate system password prompt and force password change
        alert(
          "Veuillez saisir le mot de passe de votre système pour continuer. Vous serez ensuite redirigé pour changer votre mot de passe."
        );
        navigate("/settings/change-password"); // Assuming a route for changing password
      } else {
        setError(result.message || "Mot de passe incorrect");
      }
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppBar />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl text-center transition-all duration-500">
          <img src={Logo} alt="Logo" className="w-[100px] h-[100px] mx-auto" />
          <h1 className="text-2xl font-bold text-center">Connexion</h1>
          <form onSubmit={handleLogin} className="space-y-6">
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
                className="w-full px-3 py-2 mt-1 outline-none border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={isLockedOut || systemPasswordRequired}
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            {isLockedOut && remainingTime > 0 && (
              <p className="text-orange-500 text-sm text-center">
                Réessayez dans {formatTime(remainingTime)}.
              </p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 outline-none focus:outline-none outline-none focus:ring-2 outline-none focus:ring-offset-2 outline-none focus:ring-indigo-500"
              disabled={isLockedOut || systemPasswordRequired}
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Connexion;
