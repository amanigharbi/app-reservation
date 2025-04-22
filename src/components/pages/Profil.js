import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../../firebase"; // Assure-toi d'avoir accès à ta base de données Firebase pour récupérer les données utilisateur.
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Pour récupérer des données spécifiques d'un utilisateur depuis Firestore.
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn,
  MDBIcon,
} from "mdb-react-ui-kit";
import logo from "../../images/logo-3.png";
import "../styles/Pages.css";

function Profil() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        // Vérifie manuellement l'ID dans Firestore
console.log("Chemin Firestore attendu :", `users/${currentUser.uid}`);

      if (currentUser) {
        console.log("Utilisateur connecté :", currentUser.uid);
  
        const userRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userRef);
  
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          console.log("Données utilisateur récupérées :", userData);
          setUser(userData);
        } else {
          console.log("Aucune donnée utilisateur trouvée pour cet UID :", currentUser.uid);
        }
      } else {
        navigate("/login");
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);
  
  

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      sessionStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <MDBContainer fluid className="dashboard-bg px-0">
      {/* Navbar */}
      <div className="dashboard-navbar d-flex align-items-center justify-content-between px-4 py-3 shadow bg-primary">
        <div className="d-flex align-items-center gap-4">
          <img
            src={logo}
            alt="Logo"
            style={{ width: "100px", backgroundColor: "transparent" }}
          />
          <nav className="dashboard-menu d-none d-md-flex gap-4">
            <Link to="/dashboard">
              <MDBIcon icon="tachometer-alt" className="me-2" /> Tableau de bord
            </Link>
            <Link to="/mes-reservations">
              <MDBIcon icon="clipboard-list" className="me-2" /> Mes
              Réservations
            </Link>
            <Link to="/reserver">
              <MDBIcon icon="calendar-check" className="me-2" /> Réserver
            </Link>
            <Link to="/profil">
              <MDBIcon icon="user-circle" className="me-2" /> Profil
            </Link>
          </nav>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.username || "Utilisateur"
              )}&background=fff&color=3B71CA&size=40`}
              alt="Avatar"
              className="rounded-circle shadow-sm"
              style={{
                width: "40px",
                height: "40px",
                border: "2px solid white",
              }}
            />
            <span className="text-white">
              {user?.email || "Utilisateur"}
            </span>
            <MDBBtn size="sm" color="white" onClick={handleLogout}>
              <MDBIcon icon="sign-out-alt" className="me-0" />
            </MDBBtn>
          </div>
        </div>
      </div>

      {/* Contenu de la page Profil */}
      <MDBContainer className="py-5 px-4">
        <h3 className="text-primary fw-bold mb-4">Mon Profil</h3>
        <MDBRow className="justify-content-center">
          <MDBCol md="8">
            <MDBCard className="shadow-lg rounded-4 border-0 bg-light">
              <MDBCardBody>
                <MDBCardTitle className="text-center text-primary">
                  Informations Utilisateur
                </MDBCardTitle>
                <MDBRow>
                  <MDBCol md="4" className="text-center">
                    {/* Avatar de l'utilisateur */}
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.username || "Utilisateur"
                      )}&background=3B71CA&color=fff&size=150`}
                      alt="Avatar"
                      className="rounded-circle mb-3 shadow-lg"
                      style={{ width: "120px", height: "120px" }}
                    />
                    <MDBCardText className="text-muted">
                      Dernière connexion :{" "}
                      {user?.createdAt?.toDate().toLocaleString()}
                    </MDBCardText>
                  </MDBCol>
                  <MDBCol md="8">
                    <MDBCardText>
                      <strong>Email :</strong> {user?.email}
                    </MDBCardText>
                    <MDBCardText>
                      <strong>Nom complet :</strong> {user?.firstName}{" "}
                      {user?.lastName}
                    </MDBCardText>
                    <MDBCardText>
                      <strong>Nom d'utilisateur :</strong> {user?.username}
                    </MDBCardText>
                  </MDBCol>
                </MDBRow>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>

      {/* Footer */}
      <footer className="footer text-center p-3 bg-primary text-white">
        © 2025 ReserGo. Tous droits réservés.
      </footer>
    </MDBContainer>
  );
}

export default Profil;
