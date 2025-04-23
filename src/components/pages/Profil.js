import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              ...userDoc.data()
            });
          } else {
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              firstName: currentUser.displayName?.split(' ')[0] || '',
              lastName: currentUser.displayName?.split(' ')[1] || '',
              username: currentUser.displayName || currentUser.email.split('@')[0]
            });
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
        } finally {
          setLoading(false);
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

  if (loading) {
    return (
      <MDBContainer className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </MDBContainer>
    );
  }

  return (
    <MDBContainer fluid className="dashboard-bg px-0">
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
              <MDBIcon icon="clipboard-list" className="me-2" /> Mes Réservations
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
                user?.username || user?.email?.split('@')[0] || "Utilisateur"
              )}&background=fff&color=3B71CA&size=40`}
              alt="Avatar"
              className="rounded-circle shadow-sm"
              style={{ width: "40px", height: "40px", border: "2px solid white" }}
            />
            <span className="text-white">
              {user?.username || user?.email?.split('@')[0] || "Utilisateur"}
            </span>
            <MDBBtn size="sm" color="white" onClick={handleLogout}>
              <MDBIcon icon="sign-out-alt" className="me-0" />
            </MDBBtn>
          </div>
        </div>
      </div>

      <MDBContainer className="py-5 px-4">
        <h3 className="text-primary fw-bold mb-4">Mon Profil</h3>
        <MDBRow className="justify-content-center">
          <MDBCol md="10">
            <MDBCard className="shadow-lg rounded-4 border-0 bg-light">
              <MDBCardBody>
                <MDBCardTitle className="text-center text-primary">Informations Utilisateur</MDBCardTitle>
                <MDBRow>
                  <MDBCol md="4" className="text-center">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.username || user?.email?.split('@')[0] || "Utilisateur"
                      )}&background=3B71CA&color=fff&size=150`}
                      alt="Avatar"
                      className="rounded-circle mb-3 shadow-lg"
                      style={{ width: "120px", height: "120px" }}
                    />
                    {user?.createdAt && (
                      <MDBCardText className="text-muted">
                        Dernière connexion : {user.createdAt.toDate ? user.createdAt.toDate().toLocaleString() : new Date(user.createdAt).toLocaleString()}
                      </MDBCardText>
                    )}
                  </MDBCol>
                  <MDBCol md="8">
                    <MDBCardText><strong>Email :</strong> {user?.email}</MDBCardText>
                    <MDBCardText><strong>Nom complet :</strong> {user?.firstName || 'Non spécifié'} {user?.lastName || ''}</MDBCardText>
                    <MDBCardText><strong>Nom d'utilisateur :</strong> {user?.username || user?.email?.split('@')[0] || 'Non spécifié'}</MDBCardText>
                    <MDBCardText><strong>ID Utilisateur :</strong> {user?.uid}</MDBCardText>
                  </MDBCol>
                </MDBRow>

                <MDBRow className="mt-4">
                  <MDBCol md="4">
                    <h5 className="text-primary">Réseaux & Liens</h5>
                    <MDBCardText><MDBIcon fab icon="globe" className="me-2" /> https://monprofil.dev</MDBCardText>
                    <MDBCardText><MDBIcon fab icon="github" className="me-2" /> github.com/monspeudo</MDBCardText>
                    <MDBCardText><MDBIcon fab icon="twitter" className="me-2" /> @monpseudo</MDBCardText>
                    <MDBCardText><MDBIcon fab icon="instagram" className="me-2" /> @moninsta</MDBCardText>
                    <MDBCardText><MDBIcon fab icon="facebook" className="me-2" /> facebook.com/moi</MDBCardText>
                  </MDBCol>

                  <MDBCol md="4">
                    <h5 className="text-primary">Compétences</h5>
                    <p className="mb-1">Web Design</p>
                    <div className="progress mb-3">
                      <div className="progress-bar bg-info" style={{ width: "90%" }}>90%</div>
                    </div>
                    <p className="mb-1">Website Markup</p>
                    <div className="progress mb-3">
                      <div className="progress-bar bg-success" style={{ width: "85%" }}>85%</div>
                    </div>
                    <p className="mb-1">One Page</p>
                    <div className="progress mb-3">
                      <div className="progress-bar bg-warning" style={{ width: "70%" }}>70%</div>
                    </div>
                    <p className="mb-1">Mobile Template</p>
                    <div className="progress mb-3">
                      <div className="progress-bar bg-danger" style={{ width: "60%" }}>60%</div>
                    </div>
                    <p className="mb-1">Backend API</p>
                    <div className="progress mb-3">
                      <div className="progress-bar bg-primary" style={{ width: "75%" }}>75%</div>
                    </div>
                  </MDBCol>

                  <MDBCol md="4">
                    <h5 className="text-primary">Projets en Cours</h5>
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <MDBIcon icon="check-circle" className="text-success me-2" /> Web Design - <span className="text-success">Terminé</span>
                      </li>
                      <li className="mb-2">
                        <MDBIcon icon="spinner" className="text-warning me-2" spin /> Website Markup - <span className="text-warning">En cours</span>
                      </li>
                      <li className="mb-2">
                        <MDBIcon icon="hourglass-start" className="text-secondary me-2" /> One Page - <span className="text-secondary">Prévu</span>
                      </li>
                      <li className="mb-2">
                        <MDBIcon icon="mobile-alt" className="text-info me-2" /> Mobile Template - <span className="text-info">En cours</span>
                      </li>
                      <li className="mb-2">
                        <MDBIcon icon="server" className="text-danger me-2" /> Backend API - <span className="text-danger">À faire</span>
                      </li>
                    </ul>
                  </MDBCol>
                </MDBRow>

              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>

      <footer className="footer text-center p-3 bg-primary text-white">
        © 2025 ReserGo. Tous droits réservés.
      </footer>
    </MDBContainer>
  );
}

export default Profil;
