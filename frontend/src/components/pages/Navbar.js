import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MDBIcon } from "mdb-react-ui-kit";
import logo from "../../images/logo-3.png";
import { auth } from "../../firebase";

import { onAuthStateChanged, getIdToken } from "firebase/auth";

import axios from "axios"; // Utilisez axios pour faire des requêtes HTTP

function Navbar() {
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [error, setError] = useState(null); // État pour gérer les erreurs
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email);
        const token = await getIdToken(currentUser);

        try {
          // Appel backend sécurisé
          const response = await axios.get(
            "http://localhost:5000/api/protected/navbar",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = response.data;
          console.log("Données récupérées:", data.user); // Debugging

          setUser(data.user || currentUser);
        } catch (error) {
          console.error("Erreur backend sécurisé:", error);
          setError("Erreur lors de la récupération des données.");
        }
      } else {
        setUserEmail(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogout = async () => {
    try {
      // Logique de déconnexion ici, par exemple supprimer le token
      localStorage.removeItem("token");
      window.location.href = "/login"; // Rediriger vers la page de connexion
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  // Affichage d'un message d'erreur si nécessaire
  if (error) return <div>{error}</div>;

  // Affichage d'un message de chargement pendant que les données sont récupérées

  return (
    <div className="dashboard-navbar d-flex align-items-center justify-content-between px-4 py-3 shadow bg-primary">
      <div className="d-flex align-items-center gap-4">
        <img
          src={logo}
          alt="Logo"
          style={{ width: "100px", backgroundColor: "transparent" }}
        />
        <nav className="dashboard-menu d-none d-md-flex gap-4">
          <Link to="/dashboard" className="text-white">
            <MDBIcon icon="tachometer-alt" className="me-2" /> Tableau de bord
          </Link>
          <Link to="/mes-reservations" className="text-white">
            <MDBIcon icon="clipboard-list" className="me-2" /> Mes Réservations
          </Link>
          <Link to="/reserver" className="text-white">
            <MDBIcon icon="calendar-check" className="me-2" /> Réserver
          </Link>
          <Link to="/profil" className="text-white">
            <MDBIcon icon="user-circle" className="me-2" /> Profil
          </Link>
        </nav>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <img
            src={
              user?.photoURL ||
              "https://ui-avatars.com/api/?name=Utilisateur&background=3B71CA&color=fff&size=40"
            }
            alt="Avatar"
            className="rounded-circle shadow-sm"
            style={{ width: "40px", height: "40px", border: "2px solid white" }}
          />
          <Link to="/profil" className="text-white text-decoration-none">
            <span>{user?.username || "Utilisateur"}</span>
          </Link>
          <button
            className="btn btn-white btn-sm"
            onClick={handleLogout}
            title="Déconnexion"
            style={{ padding: "0.25rem 0.5rem" }}
          >
            <MDBIcon icon="sign-out-alt" className="me-0" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
