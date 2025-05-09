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
import ProfilAdmin from "./components/admin/ProfilAdmin";

import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
//partie admin

import AdminLayout from "./components/admin/AdminLayout";
import DashboardAdmin from "./components/admin/Dashboard";
import Reservations from "./components/admin/Reservations";
import ReservationDetail from "./components/admin/ReservationDetails";
import Espaces from "./components/admin/Espaces";
import EspaceDetails from "./components/admin/EspaceDetails";
import Users from "./components/admin/Users";
import UserDetails from "./components/admin/UserDetails";
import "./i18n";

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
        {/*  Partie admin */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<DashboardAdmin />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="reservation/:id" element={<ReservationDetail />} />
          <Route path="profilAdmin" element={<ProfilAdmin />} />

          <Route path="espaces" element={<Espaces />} />
          <Route path="espace-details/:spaceId" element={<EspaceDetails />} />

          <Route path="users" element={<Users />} />
          <Route path="user-details/:userId" element={<UserDetails />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
