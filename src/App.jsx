import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Projects from './pages/Projects';
import Stock from './pages/Stock';
import Me from './pages/Me';
import Users from './pages/Users';
import ForgotPass from './pages/ForgotPassword';
import NewProjectForm from './pages/NewProjectForm';
import NewUserForm from './pages/NewUserForm';
import OldProject from './pages/OldProject';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="projects" element={<Projects />} />
        <Route path="new-project-form" element={<NewProjectForm />} />
        <Route path="me" element={<Me />} />
        <Route path="history" element={<History />} />
        <Route path="stock" element={<Stock />} />
        <Route path="usuarios" element={<Users />} />
        <Route path="new-user-form" element={<NewUserForm />} />
        <Route path="forgotpass" element={<ForgotPass />} />
        <Route path="project" element={<OldProject />} />
      </Route>

    </Routes>
  );
};

export default App;
