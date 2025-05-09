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
import { useTranslation } from "react-i18next";

function Dashboard() {
  const { t } = useTranslation();
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
          setError(t("error_loading_dashboard"));
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate, t]);

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
      case "annulation_demandée":
        return "warning";
      case "En attente":
        return "dark";
      case "Archivé":
        return "secondary";
      case "refusée":
        return "danger";
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
            <h5>{t("carousel_title")}</h5>
            <p>{t("carousel_text")}</p>
          </MDBCarouselCaption>
        </MDBCarouselItem>
      </MDBCarousel>

      <div className="main-content">
        <MDBContainer className="py-5 px-4">
          <h3 className="text-primary fw-bold mb-4">{t("dashboard_title")}</h3>
          <MDBRow>
            <MDBCol md="4">
              <MDBCard className="text-center shadow-sm bg-info text-white">
                <MDBCardBody>
                  <MDBCardTitle>
                    <MDBIcon fas icon="clipboard-list" />{" "}
                    {t("reservation_count")}
                  </MDBCardTitle>
                  <MDBCardText>{reservationsCount}</MDBCardText>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            <MDBCol md="4">
              <MDBCard className="text-center shadow-sm bg-success text-white">
                <MDBCardBody>
                  <MDBCardTitle>
                    <MDBIcon fas icon="cogs" /> {t("space_count")}
                  </MDBCardTitle>
                  <MDBCardText>{spacesCount}</MDBCardText>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            <MDBCol md="4">
              <MDBCard className="text-center shadow-sm bg-warning text-white">
                <MDBCardBody>
                  <MDBCardTitle>
                    <MDBIcon fas icon="euro-sign" /> {t("total_amount")}
                  </MDBCardTitle>
                  <MDBCardText>{montantTotal.toFixed(2)} €</MDBCardText>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>

          <h3 className="text-primary fw-bold mt-5 mb-4">
            {t("recent_reservations")}
          </h3>

          {reservations.length === 0 ? (
            <MDBRow
              className="d-flex flex-column align-items-center justify-content-center"
              style={{ minHeight: "400px" }}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                alt={t("no_reservation_title")}
                style={{ width: "180px", marginBottom: "20px", opacity: 0.7 }}
              />
              <h5 className="text-muted text-center">
                {t("no_reservation_title")}
              </h5>
              <p className="text-muted text-center">
                {t("no_reservation_text")}
              </p>
              <MDBBtn
                color="primary"
                href="/reserver"
                style={{ textTransform: "none" }}
              >
                {t("make_reservation")}
              </MDBBtn>
            </MDBRow>
          ) : (
            <MDBRow>
              {reservations.map((res) => (
                <MDBCol md="6" lg="4" key={res.id} className="mb-4">
                  <MDBCard className="h-100">
                    <MDBCardBody>
                      <MDBCardTitle className="text-center text-dark">
                        <b>{t("code")} N.</b> {res.code_reservation}
                      </MDBCardTitle>
                      <MDBCardText className="text-dark">
                        📍 {res.lieu} <br /> 📅 {res.date}
                      </MDBCardText>
                      <MDBBtn
                        size="lg"
                        onClick={() => handleShowDetails(res.id)}
                        style={{
                          backgroundColor: "#3B71CA",
                          color: "white",
                          textTransform: "none",
                        }}
                      >
                        {t("view_details")}
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
                  {t("details_title")}
                </h5>
                <MDBTable striped hover responsive>
                  <MDBTableHead>
                    <tr>
                      <th>{t("field")}</th>
                      <th>{t("value")}</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    {[
                      ["code", selectedReservation.code_reservation],
                      [
                        "date",
                        new Date(selectedReservation.date).toLocaleString(),
                      ],
                      ["service", selectedReservation.service],
                      ["location", selectedReservation.lieu],
                      ["arrival", selectedReservation.heure_arrivee],
                      ["departure", selectedReservation.heure_depart],
                      [
                        "duration",
                        selectedReservation.duree
                          ? `${selectedReservation.duree} h`
                          : "-",
                      ],
                      ["participants", selectedReservation.participants],
                      [
                        "amount",
                        selectedReservation.spaceMontant
                          ? `${selectedReservation.spaceMontant} €`
                          : "-",
                      ],
                      ["payment", selectedReservation.mode_paiement],
                      ["status", selectedReservation.status],
                      ["description", selectedReservation.description],
                      ["comments", selectedReservation.commentaires],
                    ].map(([key, value], idx) => (
                      <tr key={idx}>
                        <td>{t(key)}</td>
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
              {t("close")}
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalDialog>
      </MDBModal>

      <Footer />
    </MDBContainer>
  );
}

export default Dashboard;
