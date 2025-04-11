import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
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
  MDBInput,
} from 'mdb-react-ui-kit';
import logo from '../../images/logo-3.png';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, getDoc,deleteDoc } from 'firebase/firestore';
import '../styles/Pages.css';

function MesReservations() {
  const [userEmail, setUserEmail] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [usersData, setUsersData] = useState({});
  const navigate = useNavigate();

  // useEffect pour écouter l'état de l'utilisateur et les réservations en temps réel depuis Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email);

        // Récupérer les réservations pour l'utilisateur actuel depuis Firestore
        const q = query(collection(db, 'reservations'), where('email', '==', currentUser.email));

        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          const reservationList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setReservations(reservationList);
        });

        return () => unsubscribeFirestore(); // Unsubscribe de Firestore lorsque le composant est démonté
      } else {
        setUserEmail(null);
        navigate('/login');
      }
    });

    return () => unsubscribeAuth(); // Unsubscribe de Firebase Auth lorsque le composant est démonté
  }, [navigate]);

  // Fonction pour récupérer les données de l'utilisateur à partir de l'ID utilisateur
  const fetchUserData = async (utilisateurId) => {
    const userDocRef = doc(db, 'users', utilisateurId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return userDocSnap.data();
    } else {
      console.log("Aucun utilisateur trouvé avec cet ID");
      return null;
    }
  };

  // useEffect pour charger les données des utilisateurs en fonction de l'ID de chaque réservation
  useEffect(() => {
    const loadUsersData = async () => {
      const usersMap = {};
      for (const reservation of reservations) {
        if (reservation.utilisateurId) {
          const userData = await fetchUserData(reservation.utilisateurId);
          if (userData) {
            usersMap[reservation.utilisateurId] = userData;
          }
        }
      }
      setUsersData(usersMap);
    };

    loadUsersData();
  }, [reservations]);


  const handleUpdateReservation = (reservation) => {
    navigate(`/update-reservation/${reservation.id}`, { state: { reservation } });
  };
  const handleDeleteReservation = async (reservationId) => {
    try {
      await deleteDoc(doc(db, 'reservations', reservationId));
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
    }
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      sessionStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  return (
    <MDBContainer fluid className="dashboard-bg px-0">
      {/* Navbar */}
      <div className="dashboard-navbar d-flex align-items-center justify-content-between px-4 py-3 shadow bg-primary">
        <div className="d-flex align-items-center gap-4">
          <img src={logo} alt="Logo" style={{ width: '100px', backgroundColor: 'transparent' }} />
          <nav className="dashboard-menu d-none d-md-flex gap-4">
            <Link to="/dashboard"><MDBIcon icon="tachometer-alt" className="me-2" /> Tableau de bord</Link>
            <Link to="/mes-reservations"><MDBIcon icon="clipboard-list" className="me-2" /> Mes Réservations</Link>
            <Link to="/reserver"><MDBIcon icon="calendar-check" className="me-2" /> Réserver</Link>
            <Link to="/profil"><MDBIcon icon="user-circle" className="me-2" /> Profil</Link>
          </nav>
        </div>
        <div className="d-flex align-items-center gap-3">
          <MDBInput label="Recherche" size="sm" className="search-input" style={{ maxWidth: '250px', backgroundColor: 'white' }} />
          <div className="d-flex align-items-center gap-2">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userEmail?.split('@')[0] || 'Utilisateur')}&background=fff&color=3B71CA&size=40`}
              alt="Avatar"
              className="rounded-circle"
              style={{ width: '40px', height: '40px', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            />
            <span className="text-white">{userEmail && userEmail.split('@')[0]}</span>
            <MDBBtn size="sm" color="white" onClick={handleLogout}>
              <MDBIcon icon="sign-out-alt" className="me-4" />
            </MDBBtn>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="main-content">
        <MDBContainer className="py-5 px-4">
          <h3 className="text-primary mb-4 text-center" style={{ fontWeight: 'bold' }}>Mes Réservations</h3>

          {/* Tableau des réservations */}
          <MDBRow className="d-flex flex-wrap justify-content-center ">
            {reservations.length === 0 ? (
 <MDBCol md="12" className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
 <img
   src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
   alt="Aucune réservation"
   style={{ width: '180px', marginBottom: '20px', opacity: 0.7 }}
 />
 <h5 className="text-muted text-center">Aucune réservation trouvée</h5>
 <p className="text-muted text-center">Vous n'avez pas encore effectué de réservation.</p>
 <Link to="/reserver">
   <MDBBtn color="primary">Faire une réservation</MDBBtn>
 </Link>
 </MDBCol>            ) : (
              reservations.map((res) => {
                const user = usersData[res.utilisateurId]; // Récupérer les données utilisateur à partir du map
                return (
                  <MDBCol md="4" lg="4" key={res.id} className="mb-4">
                    <MDBCard className="h-100" border='dark' background='white'>
                      <MDBCardBody>
                      <div className="d-flex justify-content-end">
                        {/* Mettre à jour */}
  <MDBBtn
    floating
    tag="a"
    color="warning"
    size="sm"
    onClick={() => handleUpdateReservation(res)}
  >
    <MDBIcon fas icon="pen" />
  </MDBBtn>

  {/* Supprimer */}
  <MDBBtn
    floating
    tag="a"
    color="danger"
    size="sm"
    onClick={() => handleDeleteReservation(res.id)}
    className="ms-2"

  >
    <MDBIcon fas icon="trash-alt" />
  </MDBBtn>

  
</div>

                        <MDBCardTitle className="text-center" style={{ color: 'black' }}><b>Réserversation N.</b> {res.code_reservation}</MDBCardTitle>
                        <MDBCardText style={{ color: 'black' }}>
                          📍 {res.lieu}<br />
                          📅 {res.date}
                        </MDBCardText>
                        {/* Afficher l'utilisateur qui a créé la réservation */}
                        {user && <MDBCardText><strong>Créée par:</strong> {user.firstName } {user.lastName}</MDBCardText>}
                      </MDBCardBody>

                      {/* Section affichant les détails de manière permanente */}
                      <div className="reservation-details p-3" style={{ backgroundColor: '#f0f0f0' }}>
                        <MDBRow className="d-flex flex-column">
                          <MDBCol>
                            <p><strong>Service:</strong> {res.service}</p>
                          </MDBCol>
                          <MDBCol>
                            <p><strong>Lieu:</strong> {res.lieu}</p>
                          </MDBCol>
                          <MDBCol>
                            <p><strong>Date:</strong> {res.date}</p>
                          </MDBCol>
                          <MDBCol>
                            <p><strong>Durée:</strong> {res.duree}</p>
                          </MDBCol>
                          <MDBCol>
                            <p><strong>Statut:</strong> {res.statut}</p>
                          </MDBCol>
                          <MDBCol>
                            <p><strong>Participants:</strong> {res.participants}</p>
                          </MDBCol>
                          <MDBCol>
                            <p><strong>Mode de Paiement:</strong> {res.mode_paiement}</p>
                          </MDBCol>
                          <MDBCol>
                            <p><strong>Commentaires:</strong> {res.commentaires}</p>
                          </MDBCol>
                          
                          <MDBCol>
                            <p><strong>Heure d'arrivée:</strong> {res.heure_arrivee}</p>
                          </MDBCol>
                          <MDBCol>
                            <p><strong>Heure de départ:</strong> {res.heure_depart}</p>
                          </MDBCol>
                          <MDBCol>
                            <p><strong>Rappels:</strong> {Array.isArray(res.rappels) ? res.rappels.join(', ') : 'Aucun rappel'}</p>
                          </MDBCol>
                        </MDBRow>
                      </div>
                    </MDBCard>
                  </MDBCol>
                );
              })
            )}
          </MDBRow>
        </MDBContainer>
      </div>

      {/* Footer */}
      <footer className="footer-dashboard text-center p-3 bg-primary text-white">
        © 2025 ReserGo. Tous droits réservés.
      </footer>
    </MDBContainer>
  );
}

export default MesReservations;
