import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import { AuthProvider } from './pages/AuthContext'; // Asegúrate de la ruta correcta
import PrivateRoute from './pages/PrivateRoute'; // Asegúrate de la ruta correcta

// Ruta protegida
import Dashboard from './pages/Dashboard'; 

// News routes - could be accessible by different user types 
import Notifi from './pages/Notifications';
import NewProjects from './pages/News/NewProjects';
import NewAssemblies from './pages/News/NewAssemblies';
import NewItems from './pages/News/NewItems';
import NewSubassemblies from './pages/News/NewSubassemblies';
import News from './pages/News';
import Me from './pages/Me';

import Bars from './pages/barss';

// Admin only
import Users from './pages/Users';
import NewUserForm from './pages/NewUserForm';

// Admin or Operational users
import OldProject from './pages/ProjectsSection/ProjectsHistory/OldProject';
import History from './pages/ProjectsSection/ProjectsHistory/History';
import Stock from './pages/Stock';
import StockUpdate from './pages/StockUpdate';

import Projects from './pages/ProjectsSection/ProjectsInDevelopment/Projects';   //Projects in development
import ProjectDetails from './pages/ProjectsSection/ProjectsInDevelopment/ProjectDetails';   //Project Details in development
import ProjectsManagment from './pages/ProjectsSection/RefactoringProjectsManagment/RefactoringProjectsManagment';
import MaterialsManagment from './pages/ProjectsSection/RefactoringMaterialsManagment/RefactoringMaterialsManagment'; //??

import ForgotPass from './pages/ForgotPassword'; //??

const App = () => {   
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Ruta protegida */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
          
          {/* News routes - could be accessible by different user types */}
          <Route path="new-projects" element={<PrivateRoute><NewProjects /></PrivateRoute>} />
          <Route path="new-assemblies" element={<PrivateRoute><NewAssemblies /></PrivateRoute>} />
          <Route path="new-items" element={<PrivateRoute><NewItems /></PrivateRoute>} />
          <Route path="new-subassemblies" element={<PrivateRoute><NewSubassemblies /></PrivateRoute>} />
          <Route path="news" element={<PrivateRoute><News /></PrivateRoute>} />
          <Route path="me" element={<PrivateRoute><Me /></PrivateRoute>} />
          <Route path="stock-update" element={<PrivateRoute><StockUpdate /></PrivateRoute>} />

          <Route path="bars" element={<PrivateRoute><Bars /></PrivateRoute>} />
          
          {/* Admin only */}
         
          <Route path="usuarios" element={<PrivateRoute requiredRole={1}><Users /></PrivateRoute>} />  
     
          <Route path="new-user-form" element={<PrivateRoute requiredRole={1}><NewUserForm /></PrivateRoute>} />

          {/* Admin or Operational users */}
          <Route path="notifi" element={<PrivateRoute><Notifi /></PrivateRoute>} />
          <Route path="old-project" element={<PrivateRoute><OldProject /></PrivateRoute>} />
          <Route path="history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="stock" element={<PrivateRoute><Stock /></PrivateRoute>} />


          <Route path="projects" element={<PrivateRoute><Projects /></PrivateRoute>} />  {/*requiredRole={2}*/}
          <Route path="project-details" element={<PrivateRoute><ProjectDetails /></PrivateRoute>} />

          <Route path="projects-managment" element={<PrivateRoute><ProjectsManagment /></PrivateRoute>} />
          <Route path="materials-managment" element={<PrivateRoute><MaterialsManagment /></PrivateRoute>} />

          <Route path="forgotpass" element={<PrivateRoute><ForgotPass /></PrivateRoute>} /> {/*??*/}

        </Route>
      </Routes>
    </AuthProvider>
  );
};


export default App;