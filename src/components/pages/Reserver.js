import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle, MDBCardText, MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import logo from '../../images/logo-3.png';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import ReservationForm from './ReservationForm';  
import '../styles/Pages.css';

function Reserver() {
  const [userEmail, setUserEmail] = useState(null);
  const [availableSpaces, setAvailableSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);

  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // useEffect pour écouter l'état de l'utilisateur et récupérer les es ces disponibles en temps réel
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email);

        const q = query(collection(db, 'spaces'), where('available', '==', true));

        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          const spacesList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAvailableSpaces(spacesList);
        });

        return () => unsubscribeFirestore(); // Unsubscribe de Firestore lorsque le composant est démonté
      } else {
        setUserEmail(null);
        navigate('/login');
      }
    });

    return () => unsubscribeAuth(); // Unsubscribe de Firebase Auth lorsque le composant est démonté
  }, [navigate]);

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

  const handleReservation = (space) => {
    setSelectedSpace(space);
    setStep(2); // Passer à l'étape 2 : Détails de la réservation
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
          {/* <MDBInput label="Recherche" size="sm" className="search-input" style={{ maxWidth: '250px', backgroundColor: 'white' }} /> */}
          <div className="d-flex align-items-center gap-2">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userEmail?.split('@')[0] || 'Utilisateur')}&background=fff&color=3B71CA&size=40`}
              alt="Avatar"
              className="rounded-circle"
              style={{ width: '40px', height: '40px', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            />
            <span className="text-white">{userEmail && userEmail.split('@')[0]}</span>
            <MDBBtn size="sm" color="white" onClick={handleLogout}>
              <MDBIcon icon="sign-out-alt" className="me-0" />
            </MDBBtn>
          </div>
        </div>
      </div>

      {/* Étape 1: Affichage des espaces disponibles */}
      {step === 1 && (
        <MDBContainer className="py-5">
          <h3 className="text-primary mb-4 text-center" style={{ fontWeight: 'bold' }}>Réserver un Espace</h3>
          <MDBRow className='justify-content-center'>
            {availableSpaces.length === 0 ? (
              <MDBCol md="12" className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                  alt="Aucun espace disponible"
                  style={{ width: '180px', marginBottom: '20px', opacity: 0.7 }}
                />
                <h5 className="text-muted text-center">Aucun espace disponible pour le moment</h5>
              </MDBCol>
            ) : (
              availableSpaces.map((space) => (
                <MDBCol md="6" lg="4" key={space.id} className="mb-4">
                  <MDBCard className="h-100" border="dark" background="white">
                    <MDBCardBody>
                      <MDBCardTitle className="text-center" style={{ color: 'black' }}><b>{space.name}</b></MDBCardTitle>
                      <MDBCardText style={{ color: 'black' }}>
                        📍 {space.location}<br />
                        🕒 {space.availableFrom} - {space.availableTo}<br></br>
                        💰 {space.montant ? `${space.montant} € par heure` : 'Non spécifié'}

                      </MDBCardText>
                      <MDBBtn size="lg" color="deep-purple" style={{ textTransform: 'none', backgroundColor: '#3B71CA', color: 'white' }} onClick={() => handleReservation(space)}>
                        Réserver cet espace
                      </MDBBtn>
                    </MDBCardBody>
                  </MDBCard>
                </MDBCol>
              ))
            )}
          </MDBRow>
        </MDBContainer>
      )}

      {/* Étape 2: Passer l’espace à ReservationForm */}
      {step === 2 && <ReservationForm space={selectedSpace} />}
      
      {/* Footer */}
      <footer className="footer text-center p-3 bg-primary text-white">
        © 2025 ReserGo. Tous droits réservés.
      </footer>
    </MDBContainer>
  );
}

export default Reserver;
