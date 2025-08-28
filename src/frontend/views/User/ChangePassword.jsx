import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../../services";

function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      // Assuming a fixed username for now, or you'd get it from session/context
      const result = await AuthService.changePassword("user", newPassword);
      if (result.success) {
        setSuccess("Mot de passe changé avec succès ! Redirection...");
        // Clear the system password required flag after successful change
        await window.electronAPI.store.set(
          "system_password_required_user",
          false
        );
        setTimeout(() => {
          navigate("/"); // Redirect to dashboard or login
        }, 2000);
      } else {
        setError(
          result.message || "Erreur lors du changement de mot de passe."
        );
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue.");
      console.error("Error changing password:", err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">
          Changer le mot de passe
        </h1>
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div>
            <label
              htmlFor="newPassword"
              className="text-sm font-medium text-gray-700"
            >
              Nouveau mot de passe
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm outline-none focus:outline-none outline-none focus:ring-indigo-500 outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirmer le nouveau mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm outline-none focus:outline-none outline-none focus:ring-indigo-500 outline-none focus:border-indigo-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && (
            <p className="text-green-500 text-sm text-center">{success}</p>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 outline-none focus:outline-none outline-none focus:ring-2 outline-none focus:ring-offset-2 outline-none focus:ring-indigo-500"
          >
            Changer le mot de passe
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
