import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Componente de ruta protegida
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // Si no está logueado, redirige al login
    return <Navigate to="/" replace />;
  }

  return children; // Si está logueado, muestra los componentes hijos
};

export default PrivateRoute;
