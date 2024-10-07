import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Historico from './pages/Historico';
import Projects from './pages/Projects';
import Stock from './pages/Stock';
import Me from './pages/Me';
import Users from './pages/Users';
import ForgotPass from './pages/ForgotPassword';


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="historico" element={<Historico />} />
        <Route path="me" element={<Me />} />
        <Route path="projects" element={<Projects />} />
        <Route path="stock" element={<Stock />} />
        <Route path="usuarios" element={<Users />} />
        <Route path="forgotpass" element={<ForgotPass />} />
      </Route>

    </Routes>
  );
};

export default App;
