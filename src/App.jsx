import React from 'react';
import { Routes, Route } from 'react-router-dom';


import Login from './pages/Login';
import { AuthProvider } from './pages/AuthContext'; // Asegúrate de la ruta correcta
import PrivateRoute from './pages/PrivateRoute'; // Asegúrate de la ruta correcta

import Dashboard from './pages/Dashboard';
<<<<<<< HEAD
import Notifi from './pages/Notifications';
=======
import History from './pages/History';
import Projects from './pages/ProjectDetails';   //Projects in development
import ProjectDetails from './pages/ProjectDetails';   //Project Details in development
import Stock from './pages/Stock';
>>>>>>> 09e90fd9ab92ba34d249d7bd27cb84a4b2224e66
import Me from './pages/Me';
import Stock from './pages/Stock';
import Users from './pages/Users';
import ForgotPass from './pages/ForgotPassword';
import NewUserForm from './pages/NewUserForm';
<<<<<<< HEAD

import Projects from './pages/ProjectsSection/ProjectsInDevelopment/Projects';   //Projects in development
import ProjectDetails from './pages/ProjectsSection/ProjectsInDevelopment/ProjectDetails';   //Project Details in development
import History from './pages/ProjectsSection/ProjectsHistory/History';
import OldProject from './pages/ProjectsSection/ProjectsHistory/OldProject';
import ProjectsManagment from './pages/ProjectsSection/RefactoringProjectsManagment/RefactoringProjectsManagment';   //Refactoring Projects Table(Edit and Delete) and Projects Form(Add new project)

=======
import OldProject from './pages/OldProject';
import Notifi from './pages/Notifications';
import NewProjects from './pages/News/NewProjects';
import NewAssemblies from './pages/News/NewAssemblies';
import NewItems from './pages/News/NewItems';
import NewSubassemblies from './pages/News/NewSubassemblies';
import News from './pages/News';
>>>>>>> 09e90fd9ab92ba34d249d7bd27cb84a4b2224e66

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Ruta protegida */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
          <Route path="me" element={<PrivateRoute><Me /></PrivateRoute>} />
          {/* Admin or Operational users */}
          <Route path="projects" element={<PrivateRoute requiredRole={2}><Projects /></PrivateRoute>} />
          <Route path="project-details" element={<PrivateRoute><ProjectDetails /></PrivateRoute>} />
          <Route path="history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="stock" element={<PrivateRoute><Stock /></PrivateRoute>} />
          <Route path="usuarios" element={<PrivateRoute requiredRole={1}><Users /></PrivateRoute>} /> {/* Admin only */}
          <Route path="new-user-form" element={<PrivateRoute requiredRole={1}><NewUserForm /></PrivateRoute>} /> {/* Admin only */}
          <Route path="old-project" element={<PrivateRoute><OldProject /></PrivateRoute>} />
          <Route path="forgotpass" element={<PrivateRoute><ForgotPass /></PrivateRoute>} />
          <Route path="notifi" element={<PrivateRoute><Notifi /></PrivateRoute>} />
          {/* News routes - could be accessible by different user types */}
          <Route path="new-projects" element={<PrivateRoute><NewProjects /></PrivateRoute>} />
          <Route path="new-assemblies" element={<PrivateRoute><NewAssemblies /></PrivateRoute>} />
          <Route path="new-items" element={<PrivateRoute><NewItems /></PrivateRoute>} />
          <Route path="new-subassemblies" element={<PrivateRoute><NewSubassemblies /></PrivateRoute>} />
          <Route path="news" element={<PrivateRoute><News /></PrivateRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};


export default App;