import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { AuthService } from "../../services";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const hasUsers = await AuthService.hasUsers();
      if (!hasUsers) {
        navigate("/inscription");
        return;
      }

      const loggedIn = await window.electronAPI.store.get("loggedIn");
      setIsAuthenticated(loggedIn === true);
      if (loggedIn !== true) {
        navigate("/connexion");
      }
    };

    checkAuth();
  }, [navigate]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/connexion" />;
};

export default ProtectedRoute;
