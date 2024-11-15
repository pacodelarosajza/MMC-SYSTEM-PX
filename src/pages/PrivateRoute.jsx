import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from './AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { userType } = useAuth();

  // Check if user is logged in
  if (!userType) {
    return <Navigate to="/" />;
  }

  // If a requiredRole is provided, check if the user has the right role
  if (requiredRole && requiredRole !== userType) {
    return <Navigate to="/not-authorized" />;
  }

  return children;
};

export default PrivateRoute;
