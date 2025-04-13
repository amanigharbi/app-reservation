import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  MDBContainer,
  MDBBtn,
  MDBIcon,
  MDBInput,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from 'mdb-react-ui-kit';
import logo from '../../images/logo-3.png';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, getDoc, deleteDoc } from 'firebase/firestore';
import html2pdf from 'html2pdf.js';

import '../styles/Pages.css';

function MesReservations() {

  const [userEmail, setUserEmail] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [usersData, setUsersData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email);
        const q = query(collection(db, 'reservations'), where('utilisateurId', '==', currentUser.uid));
        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          const reservationList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setReservations(reservationList);
        });
        return () => unsubscribeFirestore();
      } else {
        setUserEmail(null);
        navigate('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const fetchUserData = async (utilisateurId) => {
    const userDocRef = doc(db, 'users', utilisateurId);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists() ? userDocSnap.data() : null;
  };

  useEffect(() => {
    const loadUsersData = async () => {
      const usersMap = {};
      for (const reservation of reservations) {
        if (reservation.utilisateurId && !usersMap[reservation.utilisateurId]) {
          const userData = await fetchUserData(reservation.utilisateurId);
          if (userData) usersMap[reservation.utilisateurId] = userData;
        }
      }
      setUsersData(usersMap);
    };
    loadUsersData();
  }, [reservations]);

  const handleUpdateReservation = (reservation) => {
    navigate(`/update-reservation/${reservation.id}`, { state: { reservation } });
  };

  const handleDeleteReservation = async (id) => {
    try {
      await deleteDoc(doc(db, 'reservations', id));
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Code', 'Date', 'Durée', 'Service', 'Espace', 'Montant', 'Participants'];
    const rows = reservations.map((res) => [
      res.code_reservation,
      new Date(res.date).toLocaleString(),
      res.duree,
      res.service,
      res.spaceName,
      res.spaceMontant,
      res.participants
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mes_reservations.csv';
    a.click();
  };


  const handleExportPDF = () => {
    const element = document.getElementById('reservations-table');
    const opt = {
      margin:       0.3,
      filename:     'mes_reservations.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
  
    html2pdf().set(opt).from(element).save();
  };
  
  
  

  const filteredReservations = reservations.filter(res =>
    res.code_reservation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.lieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MDBContainer fluid className="dashboard-bg px-0">
      {/* Navbar */}
      <div className="dashboard-navbar d-flex align-items-center justify-content-between px-4 py-3 shadow bg-primary">
        <div className="d-flex align-items-center gap-4">
          <img src={logo} alt="Logo" style={{ width: '100px' }} />
          <nav className="dashboard-menu d-none d-md-flex gap-4">
            <Link to="/dashboard"><MDBIcon icon="tachometer-alt" className="me-2" /> Tableau de bord</Link>
            <Link to="/mes-reservations"><MDBIcon icon="clipboard-list" className="me-2" /> Mes Réservations</Link>
            <Link to="/reserver"><MDBIcon icon="calendar-check" className="me-2" /> Réserver</Link>
            <Link to="/profil"><MDBIcon icon="user-circle" className="me-2" /> Profil</Link>
          </nav>
        </div>
        <div className="d-flex align-items-center gap-2">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userEmail?.split('@')[0] || 'Utilisateur')}&background=fff&color=3B71CA&size=40`}
            alt="Avatar"
            className="rounded-circle"
            style={{ width: '40px', height: '40px', border: '2px solid white' }}
          />
          <span className="text-white">{userEmail && userEmail.split('@')[0]}</span>
          <MDBBtn size="sm" color="white" onClick={signOut}>
            <MDBIcon icon="sign-out-alt" />
          </MDBBtn>
        </div>
      </div>

      {/* Main Content */}
      <MDBContainer className="py-5 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-primary fw-bold">Mes Réservations</h3>
          <div className="d-flex gap-2">
            <MDBInput
              label="Rechercher..."
              size="sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MDBBtn size="sm" color="success" onClick={handleExportCSV}>
              <MDBIcon icon="file-csv" />
            </MDBBtn>
            <MDBBtn size="sm" color="danger" onClick={handleExportPDF}>
              <MDBIcon icon="file-pdf" />
            </MDBBtn>
          </div>
        </div>

        {filteredReservations.length === 0 ? (
          <div className="text-center py-5 justify-content-center align-items-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt="Aucune réservation"
              style={{ width: '180px', marginBottom: '20px', opacity: 0.7 , marginLeft: '42%'}}
            />
            <h5 className="mt-3 text-muted">Aucune réservation trouvée</h5>
            <Link to="/reserver">
              <MDBBtn color="primary" className="mt-3" style={{ textTransform: 'none'}}>Faire une réservation</MDBBtn>
            </Link>
          </div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }} id="reservations-table">
            <MDBTable striped hover responsive>
            <MDBTableHead className=" text-blue-800 text-center" style={{fontWeight: 'bold', fontSize: '1.0rem'}}>
            <tr>
                  <th>Code</th>
                  <th>Date</th>
                  <th>Durée</th>
                  <th>Service</th>
                  <th>Montant</th>
                  <th>Participants</th>
                  <th>Statut</th>
                  <th>Espace</th>
                  <th>Actions</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {filteredReservations.map((res) => (
                  <tr key={res.id}>
                    <td><strong>{res.code_reservation}</strong></td>
                    <td>{new Date(res.date).toLocaleString()}</td>
                    <td>{res.duree} h</td>
                    <td>{res.service}</td>
                    <td>{res.spaceMontant} €</td>
                    <td>{res.participants}</td>
                    <td>{res.statut}</td>
                    <td>{res.spaceName} ({res.spaceLocation})</td>
                    <td>
                      <MDBBtn size="sm" color="warning" onClick={() => handleUpdateReservation(res)}>
                        <MDBIcon fas icon="pen" />
                      </MDBBtn>{' '}
                      <MDBBtn size="sm" color="danger" onClick={() => handleDeleteReservation(res.id)}>
                        <MDBIcon fas icon="trash" />
                      </MDBBtn>
                    </td>
                  </tr>
                ))}
              </MDBTableBody>
            </MDBTable>
          </div>
        )}
      </MDBContainer>

      <footer className="footer text-center p-3 bg-primary text-white mt-auto">
        © 2025 ReserGo. Tous droits réservés.
      </footer>
    </MDBContainer>
  );
}

export default MesReservations;
