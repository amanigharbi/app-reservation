import React, { useState, useEffect } from "react";
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
import { useTranslation } from "react-i18next";

function Reserver() {
    const { t } = useTranslation();
  
  const [availableSpaces, setAvailableSpaces] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedSpace, setSelectedSpace] = useState(null);

  useEffect(() => {
    const fetchAvailableSpaces = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_API_URL + "/api/protected/spaces"
        );
        // Filtrer uniquement les espaces disponibles
        const spacesAvailable = response.data.spaces.filter(
          (space) => space.available === true
        );
        setAvailableSpaces(spacesAvailable);
      } catch (error) {
        console.error(t("error_fetch_space"), error);
      }
    };
    fetchAvailableSpaces();
  }, [t]);

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
           {t("reser_space")}
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
                  alt={t("no_space")}
                  style={{ width: "180px", marginBottom: "20px", opacity: 0.7 }}
                />
                <h5 className="text-muted text-center">
                  {t("no_space")}
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
                        👥 {t("capacity")} :{" "}
                        {space.capacity ? space.capacity : t("not_specified")}{" "}
                        {t("per")}
                        <br />
                        💰{" "}
                        {space.montant
  ? t("per_hour", { amount: space.montant })
  : t("not_specified")}

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
                        {t("reser")}
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
