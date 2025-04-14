// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/pages/Login";      
import Register from './components/pages/Register';
import ResetPassword from './components/pages/ResetPassword'; 
import ResetPasswordForm from './components/pages/ResetPasswordForm'; 
import Dashboard from "./components/pages/Dashboard"; 
import MesReservations from "./components/pages/MesReservations"; 
import Reserver from "./components/pages/Reserver";
import UpdateReservation from "./components/pages/UpdateReservation";
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-passwordForm" element={<ResetPasswordForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mes-reservations" element={<MesReservations />} />
        <Route path="/reserver" element={<Reserver />} />
        <Route path="/update-reservation/:id" element={<UpdateReservation />} />


      </Routes>
    </Router>
  );
};

export default App;
