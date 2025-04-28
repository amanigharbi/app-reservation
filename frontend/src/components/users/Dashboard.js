import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
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
  MDBCarousel,
  MDBCarouselItem,
  MDBCarouselCaption,
  MDBModal,
  MDBModalDialog,
  MDBModalHeader,
  MDBModalBody,
  MDBModalFooter,
  MDBTable,
  MDBTableBody,
  MDBTableHead,
  MDBBadge,
} from "mdb-react-ui-kit";
import axios from "axios";
import "../styles/Pages.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Dashboard() {
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reservationsCount, setReservationsCount] = useState(0);
  const [spacesCount, setSpacesCount] = useState(0);
  const [montantTotal, setMontantTotal] = useState(0);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const token = await getIdToken(currentUser);
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/protected/dashboard`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const data = response.data;
          setReservations(data.recentReservations || []);
          setReservationsCount(data.reservationsCount || 0);
          setSpacesCount(data.spacesCount || 0);
          setMontantTotal(data.totalAmount || 0);
        } catch (error) {
          console.error("Erreur backend sécurisé:", error);
          setError("Erreur lors de la récupération des données.");
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const handleShowDetails = async (reservationId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/protected/reservations/${reservationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedReservation(response.data);
      setModalOpen(true);
    } catch (error) {
      console.error("Erreur récupération réservation:", error);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedReservation(null);
  };

  const getBadgeColor = (status) => {
    switch (status) {
      case "acceptée":
        return "success";
      case "annulée":
        return "danger";
      case "annulation demandée":
      case "En attente":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <MDBContainer fluid className="dashboard-bg px-0">
      <Navbar />
      {error && <div className="alert alert-danger">{error}</div>}

      <MDBCarousel showIndicators showControls fade className="carousel-top">
        <MDBCarouselItem itemId={1}>
          <img
            src="https://steelcase-res.cloudinary.com/image/upload/c_fill,q_auto,f_auto,h_656,w_1166/v1479916380/www.steelcase.com/2016/11/23/16-0016132.jpg"
            className="d-block w-100 carousel-image"
            alt="Espace de travail"
          />
          <MDBCarouselCaption>
            <h5>Premier Slide</h5>
            <p>Explorez notre espace de travail moderne et collaboratif.</p>
          </MDBCarouselCaption>
        </MDBCarouselItem>
      </MDBCarousel>

      <div className="main-content">
        <MDBContainer className="py-5 px-4">
          <h3 className="text-primary fw-bold mb-4">Tableau de bord</h3>
          <MDBRow>
            <MDBCol md="4">
              <MDBCard className="text-center shadow-sm bg-info text-white">
                <MDBCardBody>
                  <MDBCardTitle>
                    <MDBIcon fas icon="clipboard-list" /> Nombre de Réservations
                  </MDBCardTitle>
                  <MDBCardText>{reservationsCount}</MDBCardText>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            <MDBCol md="4">
              <MDBCard className="text-center shadow-sm bg-success text-white">
                <MDBCardBody>
                  <MDBCardTitle>
                    <MDBIcon fas icon="cogs" /> Nombre d'Espaces
                  </MDBCardTitle>
                  <MDBCardText>{spacesCount}</MDBCardText>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            <MDBCol md="4">
              <MDBCard className="text-center shadow-sm bg-warning text-white">
                <MDBCardBody>
                  <MDBCardTitle>
                    <MDBIcon fas icon="euro-sign" /> Montant Total Payé
                  </MDBCardTitle>
                  <MDBCardText>{montantTotal.toFixed(2)} €</MDBCardText>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>

          <h3 className="text-primary fw-bold mt-5 mb-4">
            Réservations récentes
          </h3>

          {reservations.length === 0 ? (
            <MDBRow
              className="d-flex flex-column align-items-center justify-content-center"
              style={{ minHeight: "400px" }}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                alt="Aucune réservation"
                style={{ width: "180px", marginBottom: "20px", opacity: 0.7 }}
              />
              <h5 className="text-muted text-center">
                Aucune réservation trouvée
              </h5>
              <p className="text-muted text-center">
                Vous n'avez pas encore effectué de réservation.
              </p>
              <MDBBtn
                color="primary"
                style={{ textTransform: "none" }}
                href="/reserver"
              >
                Faire une réservation
              </MDBBtn>
            </MDBRow>
          ) : (
            <MDBRow>
              {reservations.map((res) => (
                <MDBCol md="6" lg="4" key={res.id} className="mb-4">
                  <MDBCard className="h-100">
                    <MDBCardBody>
                      <MDBCardTitle className="text-center text-dark">
                        <b>Réservation N.</b> {res.code_reservation}
                      </MDBCardTitle>
                      <MDBCardText className="text-dark">
                        📍 {res.lieu} <br />
                        📅 {res.date}
                      </MDBCardText>
                      <MDBBtn
                        size="lg"
                        style={{
                          backgroundColor: "#3B71CA",
                          color: "white",
                          textTransform: "none",
                        }}
                        onClick={() => handleShowDetails(res.id)}
                      >
                        Voir Détails
                      </MDBBtn>
                    </MDBCardBody>
                  </MDBCard>
                </MDBCol>
              ))}
            </MDBRow>
          )}
        </MDBContainer>
      </div>

      <MDBModal open={modalOpen} onClose={handleCloseModal} tabIndex="-1">
        <MDBModalDialog size="lg" className="modal-content">
          <MDBModalHeader className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <h5 className="modal-title text-dark fw-bold mb-0 me-3">
                {selectedReservation?.code_reservation}
              </h5>
              {selectedReservation?.status && (
                <MDBBadge
                  color={getBadgeColor(selectedReservation.status)}
                  pill
                  className="px-3 py-2"
                  style={{ fontSize: "0.9rem" }}
                >
                  {selectedReservation.status}
                </MDBBadge>
              )}
            </div>
            <MDBBtn
              className="btn-close"
              color="none"
              onClick={handleCloseModal}
            />
          </MDBModalHeader>

          <MDBModalBody>
            {selectedReservation && (
              <div className="container mt-4">
                <h5 className="text-center text-primary mb-4">
                  Détails de la Réservation
                </h5>
                <MDBTable striped hover responsive>
                  <MDBTableHead>
                    <tr>
                      <th>Champ</th>
                      <th>Valeur</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    {[
                      [
                        "Code Réservation",
                        selectedReservation.code_reservation,
                      ],
                      [
                        "Date",
                        new Date(selectedReservation.date).toLocaleString(),
                      ],
                      ["Service", selectedReservation.service],
                      ["Lieu", selectedReservation.lieu],
                      ["Heure d'arrivée", selectedReservation.heure_arrivee],
                      ["Heure de départ", selectedReservation.heure_depart],
                      [
                        "Durée",
                        selectedReservation.duree
                          ? `${selectedReservation.duree} h`
                          : "-",
                      ],
                      ["Participants", selectedReservation.participants],
                      [
                        "Montant de l'espace",
                        selectedReservation.spaceMontant
                          ? `${selectedReservation.spaceMontant} €`
                          : "-",
                      ],
                      ["Mode de paiement", selectedReservation.mode_paiement],
                      ["Statut", selectedReservation.status],
                      ["Description", selectedReservation.description],
                      ["Commentaires", selectedReservation.commentaires],
                    ].map(([label, value], idx) => (
                      <tr key={idx}>
                        <td>{label}</td>
                        <td>{value || "-"}</td>
                      </tr>
                    ))}
                  </MDBTableBody>
                </MDBTable>
              </div>
            )}
          </MDBModalBody>

          <MDBModalFooter>
            <MDBBtn
              color="secondary"
              onClick={handleCloseModal}
              style={{ textTransform: "none" }}
            >
              Fermer
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalDialog>
      </MDBModal>

      <Footer />
    </MDBContainer>
  );
}

export default Dashboard;
