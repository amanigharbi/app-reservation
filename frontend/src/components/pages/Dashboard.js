import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const [userEmail, setUserEmail] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reservationsCount, setReservationsCount] = useState(0);
  const [spacesCount, setSpacesCount] = useState(0);
  const [montantTotal, setMontantTotal] = useState(0);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email);
        const token = await getIdToken(currentUser);

        try {
          // Appel backend sécurisé
          const response = await axios.get(
            process.env.REACT_APP_API_URL + "/api/protected/dashboard",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = response.data;

          setReservations(data.recentReservations || []);
          setReservationsCount(data.reservationsCount || 0);
          setSpacesCount(data.spacesCount || 0);
          setMontantTotal(data.totalAmount || 0);
          setUser(data.user || currentUser);
        } catch (error) {
          console.error("Erreur backend sécurisé:", error);
          setError("Erreur lors de la récupération des données.");
          navigate("/login");
        }
      } else {
        setUserEmail(null);
        navigate("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const handleShowDetails = async (reservationId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get(
        process.env.REACT_APP_API_URL +
          `/api/protected/reservations/${reservationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
              <Link to="/reserver">
                <MDBBtn color="primary" style={{ textTransform: "none" }}>
                  Faire une réservation
                </MDBBtn>
              </Link>
            </MDBRow>
          ) : (
            <MDBRow>
              {reservations.map((res) => (
                <MDBCol md="6" lg="4" key={res.id} className="mb-4">
                  <MDBCard className="h-100">
                    <MDBCardBody>
                      <MDBCardTitle
                        className="text-center"
                        style={{ color: "black" }}
                      >
                        <b>Réservation N.</b> {res.code_reservation}
                      </MDBCardTitle>
                      <MDBCardText style={{ color: "black" }}>
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
    {/* Badge Status */}
    {selectedReservation?.status && (
      <MDBBadge
        color={
          selectedReservation?.status === "acceptée"
            ? "success"
            : selectedReservation?.status === "annulée"
            ? "danger"
            : selectedReservation?.status === "annulation demandée"
            ? "warning"
            : selectedReservation?.status === "En attente"
            ? "warning"
            : "secondary"
        }
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
  ></MDBBtn>
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
                    <tr>
                      <td>Code Réservation</td>
                      <td>{selectedReservation.code_reservation || "-"}</td>
                    </tr>
                    <tr>
                      <td>Date</td>
                      <td>
                        {new Date(selectedReservation.date).toLocaleString() ||
                          "-"}
                      </td>
                    </tr>
                    <tr>
                      <td>Service</td>
                      <td>{selectedReservation.service || "-"}</td>
                    </tr>
                    <tr>
                      <td>Lieu</td>
                      <td>{selectedReservation.lieu || "-"}</td>
                    </tr>
                    <tr>
                      <td>Heure d'arrivée</td>
                      <td>{selectedReservation.heure_arrivee || "-"}</td>
                    </tr>
                    <tr>
                      <td>Heure de départ</td>
                      <td>{selectedReservation.heure_depart || "-"}</td>
                    </tr>
                    <tr>
                      <td>Durée</td>
                      <td>
                        {selectedReservation.duree
                          ? `${selectedReservation.duree} h`
                          : "-"}
                      </td>
                    </tr>
                    <tr>
                      <td>Participants</td>
                      <td>{selectedReservation.participants || "-"}</td>
                    </tr>
                    <tr>
                      <td>Montant de l'espace</td>
                      <td>
                        {selectedReservation.spaceMontant
                          ? `${selectedReservation.spaceMontant} €`
                          : "-"}
                      </td>
                    </tr>
                    <tr>
                      <td>Mode de paiement</td>
                      <td>{selectedReservation.mode_paiement || "-"}</td>
                    </tr>
                    <tr>
                      <td>Statut</td>
                      <td>{selectedReservation.status || "-"}</td>
                    </tr>
                    <tr>
                      <td>Description</td>
                      <td>{selectedReservation.description || "-"}</td>
                    </tr>
                    <tr>
                      <td>Commentaires</td>
                      <td>{selectedReservation.commentaires || "-"}</td>
                    </tr>
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
