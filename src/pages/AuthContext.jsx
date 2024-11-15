import React, { createContext, useState, useContext, useEffect } from 'react';

// Creamos el contexto para la autenticación
const AuthContext = createContext();

// Hook para acceder a la información de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Verificamos si hay un usuario guardado en el localStorage
    const storedUser = localStorage.getItem('loggedInUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Función para iniciar sesión
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('loggedInUser', JSON.stringify(userData)); // Guardamos el usuario en localStorage
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('loggedInUser'); // Eliminamos el usuario del localStorage
  };

  // Obtenemos el tipo de usuario (user_type) desde el usuario guardado
  const userType = user?.user_type_id;

  // Efecto para cargar el usuario desde localStorage al montar el componente
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, userType, login, logout }}>
      {children} {/* Renderiza los componentes hijos */}
    </AuthContext.Provider>
  );
};

export default AuthContext;
