import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import { AuthProvider } from './pages/AuthContext'; // Asegúrate de la ruta correcta
import PrivateRoute from './pages/PrivateRoute'; // Asegúrate de la ruta correcta


import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Projects from './pages/Projects';   //Projects in development
import Stock from './pages/Stock';
import Me from './pages/Me';
import Users from './pages/Users';
import ForgotPass from './pages/ForgotPassword';
import ProjectsManagment from './pages/RefactoringProjectsManagment';   //Refactoring Projects Table(Edit and Delete) and Projects Form(Add new project)
import NewUserForm from './pages/NewUserForm';
import OldProject from './pages/OldProject';

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Ruta protegida */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
          <Route path="me" element={<PrivateRoute><Me /></PrivateRoute>} />
          <Route path="projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
          <Route path="projects-managment" element={<PrivateRoute><ProjectsManagment /></PrivateRoute>} />
          <Route path="history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="stock" element={<PrivateRoute><Stock /></PrivateRoute>} />
          <Route path="usuarios" element={<PrivateRoute><Users /></PrivateRoute>} />
          <Route path="new-user-form" element={<PrivateRoute><NewUserForm /></PrivateRoute>} />
          <Route path="old-project" element={<PrivateRoute><OldProject /></PrivateRoute>} />
          <Route path="forgotpass" element={<PrivateRoute><ForgotPass /></PrivateRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
