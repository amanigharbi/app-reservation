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
  MDBCarousel,
  MDBCarouselItem,
  MDBCarouselCaption,
} from 'mdb-react-ui-kit';
import logo from '../../images/logo-3.png';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import '../styles/Pages.css';

function Dashboard() {
  const [userEmail, setUserEmail] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const navigate = useNavigate();

  // useEffect pour écouter l'état de l'utilisateur et les réservations en temps réel depuis Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email);

        // Récupérer les réservations pour l'utilisateur actuel depuis Firestore
        const q = query(collection(db, 'reservations'), where('utilisateurId', '==', currentUser.uid));

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

  // Fonction pour afficher les détails de la réservation dans la section
  const handleShowDetails = (reservation) => {
    setSelectedReservation((prev) => (prev?.id === reservation.id ? null : reservation)); // Toggle visibility
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
          {/* Barre de recherche */}
          <MDBInput label="Recherche" size="sm" className="search-input" style={{ maxWidth: '250px', backgroundColor: 'white' }} />
          
          {/* Username + Logout Button */}
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

      {/* Carousel */}
      <MDBCarousel showIndicators showControls fade className="carousel-top">
        <MDBCarouselItem itemId={1}>
          <img src="https://steelcase-res.cloudinary.com/image/upload/c_fill,q_auto,f_auto,h_656,w_1166/v1479916380/www.steelcase.com/2016/11/23/16-0016132.jpg" className="d-block w-100 carousel-image" alt="Espace de travail" />
          <MDBCarouselCaption>
            <h5>Premier Slide</h5>
            <p>Explorez notre espace de travail moderne et collaboratif.</p>
          </MDBCarouselCaption>
        </MDBCarouselItem>

        <MDBCarouselItem itemId={2}>
          <img src="https://www.burolia.fr/images/products/bureaux-splc-30873z.jpg" className="d-block w-100 carousel-image" alt="Bureau" />
          <MDBCarouselCaption>
            <h5>Bureau Privé</h5>
            <p>Des bureaux privés pour plus de confort et de productivité.</p>
          </MDBCarouselCaption>
        </MDBCarouselItem>

        <MDBCarouselItem itemId={3}>
          <img src="https://www.racinea.fr/wp-content/uploads/2021/11/racinea-notre-salle-de-reunion-modulable.jpg" className="d-block w-100 carousel-image" alt="Salle de réunion" />
          <MDBCarouselCaption>
            <h5>Salle de Réunion</h5>
            <p>Des salles de réunion modernes adaptées à vos besoins.</p>
          </MDBCarouselCaption>
        </MDBCarouselItem>

        <MDBCarouselItem itemId={4}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Salle_de_conf%C3%A9rence.JPG" className="d-block w-100 carousel-image" alt="Salle de conférence" />
          <MDBCarouselCaption>
            <h5>Salle de Conférence</h5>
            <p>La salle de conférence idéale pour vos événements professionnels.</p>
          </MDBCarouselCaption>
        </MDBCarouselItem>
      </MDBCarousel>

      {/* Contenu principal */}
      <div className="main-content">
        <MDBContainer className="py-5 px-4">
          <h3 className="text-primary mb-4 text-center" style={{ fontWeight: 'bold' }}>Réservations récentes</h3>

          {/* Tableau des réservations */}
          <MDBRow>
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
   <MDBBtn color="primary" >Faire une réservation</MDBBtn>
 </Link>
 </MDBCol>             ) : (
              reservations.map((res) => (
                <MDBCol md="6" lg="4" key={res.id} className="mb-4">
                  <MDBCard className="h-100"  border='dark' background='white'>
                    <MDBCardBody>
                      <MDBCardTitle className="text-center" style={{ color: 'black' }}><b>Réserversation N.</b> {res.code_reservation}</MDBCardTitle>
                      <MDBCardText style={{ color: 'black' }}>
                        📍 {res.lieu}<br />
                        📅 {res.date}
                      </MDBCardText>

                      <MDBBtn size="lg" color="deep-purple" style={{ textTransform: 'none', backgroundColor: '#3B71CA', color: 'white' }} onClick={() => handleShowDetails(res)}>
                        {selectedReservation?.id === res.id ? 'Masquer Détails' : 'Voir Détails'}
                      </MDBBtn>
                    </MDBCardBody>

                    {/* Section affichant les détails */}
                    {selectedReservation?.id === res.id && (
                      <div className="reservation-details p-3" style={{ backgroundColor: '#f0f0f0' }}>
                        <p><strong>Service:</strong> {res.service}</p>
                        <p><strong>Lieu:</strong> {res.lieu}</p>
                        <p><strong>Date:</strong> {res.date}</p>
                        <p><strong>Durée:</strong> {res.duree}</p>
                        <p><strong>Statut:</strong> {res.statut}</p>
                        <p><strong>Participants:</strong> {res.participants}</p>
                        <p><strong>Mode de Paiement:</strong> {res.mode_paiement}</p>
                        <p><strong>Commentaires:</strong> {res.commentaires}</p>
                        <p><strong>Code de Réservation:</strong> {res.code_reservation}</p>
                        <p><strong>Heure d'arrivée:</strong> {res.heure_arrivee}</p>
                        <p><strong>Heure de départ:</strong> {res.heure_depart}</p>
                        <p><strong>Rappels:</strong> {Array.isArray(res.rappels) ? res.rappels.join(', ') : 'Aucun rappel'}</p>
                        </div>
                    )}
                  </MDBCard>
                </MDBCol>
              ))
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

export default Dashboard;
