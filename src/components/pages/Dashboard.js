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
  MDBCarousel,
  MDBCarouselItem,
  MDBCarouselCaption,
  MDBInput,
  MDBBtn,
  MDBIcon,
} from 'mdb-react-ui-kit';
import logo from '../../images/logo-3.png';
import '../styles/Pages.css';

function Dashboard() {
  const [userEmail, setUserEmail] = useState(null);
  const [reservations, setReservations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email);
        setReservations([
          { id: 1, date: '2025-04-15', service: 'Salle de conférence', lieu: 'Tunis' },
          { id: 2, date: '2025-04-20', service: 'Bureau privé', lieu: 'Sousse' },
          { id: 3, date: '2025-04-25', service: 'Espace coworking', lieu: 'Ariana' },
        ]);
      } else {
        setUserEmail(null);
        navigate('/login');
      }
    });
    return () => unsubscribe();
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
      <MDBCarousel showIndicators showControls fade className="carousel-top" >
        <MDBCarouselItem itemId={1} >
          <img src="https://steelcase-res.cloudinary.com/image/upload/c_fill,q_auto,f_auto,h_656,w_1166/v1479916380/www.steelcase.com/2016/11/23/16-0016132.jpg"     className="d-block w-100 carousel-image" alt="Espace de travail" />
          <MDBCarouselCaption>
            <h5>Premier Slide</h5>
            <p>Explorez notre espace de travail moderne et collaboratif.</p>
          </MDBCarouselCaption>
        </MDBCarouselItem>

        <MDBCarouselItem itemId={2}>
          <img src="https://www.burolia.fr/images/products/bureaux-splc-30873z.jpg"    className="d-block w-100 carousel-image" alt="Bureau" />
          <MDBCarouselCaption>
            <h5>Bureau Privé</h5>
            <p>Des bureaux privés pour plus de confort et de productivité.</p>
          </MDBCarouselCaption>
        </MDBCarouselItem>

        <MDBCarouselItem itemId={3}>
          <img src="https://www.racinea.fr/wp-content/uploads/2021/11/racinea-notre-salle-de-reunion-modulable.jpg"    className="d-block w-100 carousel-image"  alt="Salle de réunion" />
          <MDBCarouselCaption>
            <h5>Salle de Réunion</h5>
            <p>Des salles de réunion modernes adaptées à vos besoins.</p>
          </MDBCarouselCaption>
        </MDBCarouselItem>

        <MDBCarouselItem itemId={4}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Salle_de_conf%C3%A9rence.JPG"    className="d-block w-100 carousel-image"  alt="Salle de conférence" />
          <MDBCarouselCaption>
            <h5>Salle de Conférence</h5>
            <p>La salle de conférence idéale pour vos événements professionnels.</p>
          </MDBCarouselCaption>
        </MDBCarouselItem>
      </MDBCarousel>

      {/* Contenu principal */}
      <div className="main-content">
      <MDBContainer className="py-5 px-4">
        <h3 className="text-primary mb-4" style={{ fontWeight: 'bold' }}>Réservations récentes</h3>

        {/* Tableau des réservations */}
        <MDBRow>
          {reservations.map((res) => (
            <MDBCol md="6" lg="4" key={res.id} className="mb-4">
              <MDBCard className="h-100">
                <MDBCardBody>
                  <MDBCardTitle style={{ color: 'black' }}>{res.service}</MDBCardTitle>
                  <MDBCardText style={{ color: 'black' }}>
                    📍 {res.lieu}<br />
                    📅 {res.date}
                  </MDBCardText>
                  <Link to={`/reservation/${res.id}`}>
                    <MDBBtn size="lg" color="deep-purple" style={{ textTransform: 'none', backgroundColor: '#3B71CA', color: 'white' }}>
                      Voir Détails
                    </MDBBtn>
                  </Link>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          ))}
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
