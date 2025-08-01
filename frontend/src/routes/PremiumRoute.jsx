import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const PremiumRoute = () => {
  const { user, loading, premiumBlocked } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (premiumBlocked) {
    return <Navigate to="/premium" replace />;
  }

  return <Outlet />;
};

export default PremiumRoute;
