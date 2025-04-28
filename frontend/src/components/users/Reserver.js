import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn,
} from "mdb-react-ui-kit";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ReservationForm from "./ReservationForm";

function Reserver() {
  const [availableSpaces, setAvailableSpaces] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableSpaces = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_API_URL + "/api/protected/spaces"
        );
        // Filtrer uniquement les espaces disponibles
        const spacesAvailable = response.data.spaces.filter(
          (space) => space.available === "true"
        );
        setAvailableSpaces(spacesAvailable);
      } catch (error) {
        console.error("Erreur lors de la récupération des espaces:", error);
      }
    };
    fetchAvailableSpaces();
  }, []);

  const handleReservation = (space) => {
    setSelectedSpace(space);
    setStep(2); // Passer à l'étape 2 : Détails de la réservation
  };

  return (
    <MDBContainer fluid className="dashboard-bg px-0">
      <Navbar />

      {/* Étape 1: Affichage des espaces disponibles */}
      {step === 1 && (
        <MDBContainer className="py-5">
          <h3
            className="text-primary mb-4 text-center"
            style={{ fontWeight: "bold" }}
          >
            Réserver un Espace
          </h3>
          <MDBRow className="justify-content-center">
            {availableSpaces.length === 0 ? (
              <MDBCol
                md="12"
                className="d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: "400px" }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                  alt="Aucun espace disponible"
                  style={{ width: "180px", marginBottom: "20px", opacity: 0.7 }}
                />
                <h5 className="text-muted text-center">
                  Aucun espace disponible pour le moment
                </h5>
              </MDBCol>
            ) : (
              availableSpaces.map((space) => (
                <MDBCol md="6" lg="4" key={space.id} className="mb-4">
                  <MDBCard className="h-100" border="dark" background="white">
                    <MDBCardBody>
                      <MDBCardTitle
                        className="text-center"
                        style={{ color: "black" }}
                      >
                        <b>{space.name}</b>
                      </MDBCardTitle>
                      <MDBCardText style={{ color: "black" }}>
                        📍 {space.location}
                        <br />
                        🕒 {space.availableFrom} - {space.availableTo}
                        <br />
                        👥 Capacité :{" "}
                        {space.capacity ? space.capacity : "Non spécifiée"} personnes
                        <br />
                        💰{" "}
                        {space.montant
                          ? `${space.montant} € par heure`
                          : "Non spécifié"}
                      </MDBCardText>
                      <MDBBtn
                        size="lg"
                        color="deep-purple"
                        style={{
                          textTransform: "none",
                          backgroundColor: "#3B71CA",
                          color: "white",
                        }}
                        onClick={() => handleReservation(space)}
                      >
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

      <Footer />
    </MDBContainer>
  );
}

export default Reserver;
