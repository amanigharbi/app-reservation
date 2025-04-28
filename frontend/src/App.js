// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/authentification/Login";
import Register from "./components/authentification/Register";
import ResetPassword from "./components/authentification/ResetPassword";
import ResetPasswordForm from "./components/authentification/ResetPasswordForm";
import Dashboard from "./components/users/Dashboard";
import MesReservations from "./components/users/MesReservations";
import Reserver from "./components/users/Reserver";
import UpdateReservation from "./components/users/UpdateReservation";
import Profil from "./components/users/Profil";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

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
        <Route path="/profil" element={<Profil />} />
      </Routes>
    </Router>
  );
};

export default App;
