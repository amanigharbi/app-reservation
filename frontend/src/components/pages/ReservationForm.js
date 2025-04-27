import React, { useState, useEffect } from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBBtn,
  MDBIcon,
  MDBCardText,
  MDBBadge,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ReservationForm({ space }) {
  const [etape, setEtape] = useState(1);
  const [nouveauRappel, setNouveauRappel] = useState("");
  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [spaceDetails, setSpaceDetails] = useState(space || {});

  const [reservationDetails, setReservationDetails] = useState({
    service: "",
    lieu: space?.location || "",
    date: "",
    duree: "",
    participants: "",
    description: "",
    commentaires: "",
    mode_paiement: "",
    heure_arrivee: "",
    heure_depart: "",
    rappels: [],
    montant: 0,
    spaceId: space?.id || "",
    spaceName: space?.name || "",
    spaceLocation: space?.location || "",
    spaceMontant: space?.montant || "",
  });

  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("carte");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });
  const navigate = useNavigate();

  // Calcul de la durée
  useEffect(() => {
    const { heure_arrivee, heure_depart } = reservationDetails;
    if (heure_arrivee && heure_depart) {
      const [h1, m1] = heure_arrivee.split(":").map(Number);
      const [h2, m2] = heure_depart.split(":").map(Number);
      const debut = h1 * 60 + m1;
      const fin = h2 * 60 + m2;

      if (fin > debut) {
        const dureeMinutes = fin - debut;
        const dureeHeures = (dureeMinutes / 60).toFixed(2);
        setReservationDetails((prev) => ({
          ...prev,
          duree: dureeHeures,
        }));
      }
    }
  }, [reservationDetails.heure_arrivee, reservationDetails.heure_depart]);

  // Calcul du montant
  useEffect(() => {
    const duree = parseFloat(reservationDetails.duree);
    const montantParHeure = parseFloat(spaceDetails?.montant || 0);

    if (!isNaN(duree) && !isNaN(montantParHeure)) {
      const total = duree * montantParHeure;
      setReservationDetails((prev) => ({
        ...prev,
        montant: total.toFixed(2),
      }));
    }
  }, [reservationDetails.duree, spaceDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReservationDetails({ ...reservationDetails, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (etape === 1) {
      if (!reservationDetails.service)
        newErrors.service = "Le service est requis";
      if (!reservationDetails.date) newErrors.date = "La date est requise";
      if (!reservationDetails.participants)
        newErrors.participants = "Le nombre de participants est requis";

      // Validation des heures
      const { heure_arrivee, heure_depart } = reservationDetails;
      const { availableFrom, availableTo } = spaceDetails || {};

      if (heure_arrivee && heure_depart && availableFrom && availableTo) {
        const toMinutes = (time) => {
          const [h, m] = time.split(":").map(Number);
          return h * 60 + m;
        };

        const arriveeMin = toMinutes(heure_arrivee);
        const departMin = toMinutes(heure_depart);
        const dispoMin = toMinutes(availableFrom);
        const dispoMax = toMinutes(availableTo);

        if (arriveeMin < dispoMin || departMin > dispoMax) {
          newErrors.heure_arrivee = `L'heure doit être entre ${availableFrom} et ${availableTo}`;
          newErrors.heure_depart = `L'heure doit être entre ${availableFrom} et ${availableTo}`;
        }
      }
    }

    if (etape === 2 && !reservationDetails.mode_paiement) {
      newErrors.mode_paiement = "Le mode de paiement est requis";
    }

    return newErrors;
  };

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const codeReservation = `RES-${Date.now()}`;

        const reservationData = {
          code_reservation: codeReservation,

          ...reservationDetails,
          spaceId: spaceDetails.id,
          status: "En attente",
          createdAt: new Date().toISOString(),
        };
        console.log("Données de réservation:", reservationData);
        const response = await axios.post(
          process.env.REACT_APP_API_URL + "/api/protected/reservations",
          reservationData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setShowToast({
          type: "success",
          visible: true,
          message: "Réservation créée avec succès!",
        });

        setTimeout(() => {
          navigate("/mes-reservations");
        }, 2000);
      } catch (error) {
        console.error("Erreur création réservation:", error);
        setShowToast({
          type: "error",
          visible: true,
          message:
            error.response?.data?.message || "Erreur lors de la réservation",
        });
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <MDBContainer className="py-5">
      {/* Toast de notification */}
      {showToast.visible && (
        <div
          className="position-fixed top-0 end-0 p-3"
          style={{ zIndex: 9999 }}
        >
          <div
            className={`toast show fade text-white ${
              showToast.type === "success" ? "bg-success" : "bg-danger"
            }`}
            role="alert"
          >
            <div className="toast-body">
              {showToast.message}
              <button
                type="button"
                className="btn-close btn-close-white float-end"
                onClick={() =>
                  setShowToast({ type: "", visible: false, message: "" })
                }
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête avec les détails de l'espace */}
      {spaceDetails && (
        <div className="text-center mb-4">
          <h4>
            <b>Réservation pour l'espace :</b> {spaceDetails.name}
          </h4>
          <MDBCardText>
            <strong>Lieu :</strong> {spaceDetails.location}
          </MDBCardText>
          <MDBCardText>
            <strong>Disponible :</strong> {spaceDetails.availableFrom} -{" "}
            {spaceDetails.availableTo}
          </MDBCardText>
          <MDBCardText>
            <strong>Tarif :</strong> {spaceDetails.montant} €/heure
          </MDBCardText>
        </div>
      )}

      {/* Étape 1: Détails de la réservation */}
      {etape === 1 && (
        <MDBRow>
          <MDBCol md="6" className="mb-4">
            <MDBInput
              label="Service"
              name="service"
              value={reservationDetails.service}
              onChange={handleChange}
            />
            {errors.service && (
              <div
                className="invalid-feedback d-block"
                style={{ fontSize: "0.875rem", marginTop: "0.15rem" }}
              >
                {errors.service}
              </div>
            )}
          </MDBCol>
          <MDBCol md="6" className="mb-4">
            <MDBInput
              label="Participants"
              name="participants"
              value={reservationDetails.participants}
              onChange={handleChange}
            />
            {errors.participants && (
              <div
                className="invalid-feedback d-block"
                style={{ fontSize: "0.875rem", marginTop: "0.15rem" }}
              >
                {errors.participants}
              </div>
            )}
          </MDBCol>
          <MDBCol md="6" className="mb-4">
            <MDBInput
              label="Date (YYYY-MM-DD)"
              name="date"
              value={reservationDetails.date}
              onChange={handleChange}
              feedback={errors.date}
              type="date"
            />

            {errors.date && (
              <div
                className="invalid-feedback d-block"
                style={{ fontSize: "0.875rem", marginTop: "0.15rem" }}
              >
                {errors.date}
              </div>
            )}
          </MDBCol>
          <MDBCol md="6" className="mb-4">
            <MDBInput
              label="Durée (en heures)"
              name="duree"
              value={reservationDetails.duree}
              onChange={handleChange}
              disabled
              feedback={errors.duree}
            />
            {errors.duree && (
              <div
                className="invalid-feedback d-block"
                style={{ fontSize: "0.875rem", marginTop: "0.15rem" }}
              >
                {errors.duree}
              </div>
            )}
          </MDBCol>

          <MDBCol md="6" className="mb-4">
            <MDBInput
              label="Heure d'arrivée"
              type="time"
              name="heure_arrivee"
              value={reservationDetails.heure_arrivee}
              onChange={handleChange}
            />
            {errors.heure_arrivee && (
              <div
                className="invalid-feedback d-block"
                style={{ fontSize: "0.875rem", marginTop: "0.15rem" }}
              >
                {errors.heure_arrivee}
              </div>
            )}
          </MDBCol>
          <MDBCol md="6" className="mb-4">
            <MDBInput
              label="Heure de départ"
              type="time"
              name="heure_depart"
              value={reservationDetails.heure_depart}
              onChange={handleChange}
            />
            {errors.heure_depart && (
              <div
                className="invalid-feedback d-block"
                style={{ fontSize: "0.875rem", marginTop: "0.15rem" }}
              >
                {errors.heure_depart}
              </div>
            )}
          </MDBCol>
          <MDBCol md="12" className="mb-4">
            <MDBInput
              label="Description"
              name="description"
              value={reservationDetails.description}
              onChange={handleChange}
            />
          </MDBCol>
          <MDBCol md="12" className="mb-4">
            <MDBInput
              label="Commentaires"
              name="commentaires"
              value={reservationDetails.commentaires}
              onChange={handleChange}
            />
          </MDBCol>
          <MDBCol md="12" className="mb-4">
            <MDBInput
              label="Ajouter un rappel (ex: 2025-04-20 10:00)"
              name="nouveau_rappel"
              type="datetime-local"
              value={nouveauRappel}
              onChange={(e) => setNouveauRappel(e.target.value)}
            />
            <MDBBtn
              size="sm"
              className="mt-2"
              style={{ textTransform: "none" }}
              onClick={() => {
                if (nouveauRappel) {
                  setReservationDetails((prev) => ({
                    ...prev,
                    rappels: [...prev.rappels, nouveauRappel],
                  }));
                  setNouveauRappel(""); // Réinitialiser l'entrée du rappel
                }
              }}
            >
              Ajouter un rappel
            </MDBBtn>

            {/* Affichage des rappels sous forme de badges */}
            <div className="d-flex flex-wrap mt-3">
              {reservationDetails.rappels.map((rappel, i) => (
                <MDBBadge key={i} color="primary" className="me-2 mb-2">
                  {new Date(rappel).toLocaleString()}
                </MDBBadge>
              ))}
            </div>
          </MDBCol>
        </MDBRow>
      )}

      {/* Étape 2: Paiement */}
      {etape === 2 && (
        <MDBRow>
          <MDBCol md="12">
            <label className="form-label">Mode de paiement</label>
            <select
              className="form-select mb-3"
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setReservationDetails((prev) => ({
                  ...prev,
                  mode_paiement: e.target.value,
                }));
              }}
            >
              <option value="carte">Carte de crédit</option>
              <option value="paypal">PayPal</option>
              <option value="virement">Virement bancaire</option>
            </select>

            {paymentMethod === "carte" && (
              <>
                <MDBInput
                  label="Numéro de carte"
                  value={cardDetails.number}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, number: e.target.value })
                  }
                  className="mb-2"
                />
                <div className="d-flex mb-3">
                  <MDBInput
                    label="Date expiration"
                    value={cardDetails.expiry}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        expiry: e.target.value,
                      })
                    }
                    className="me-2"
                  />
                  <MDBInput
                    label="CVV"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cvv: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            <MDBCardText className="mt-3">
              <strong>Montant à payer :</strong>{" "}
              {reservationDetails.montant
                ? `${Number(reservationDetails.montant).toLocaleString(
                    "fr-FR"
                  )} €`
                : "Non spécifié"}
            </MDBCardText>
          </MDBCol>
        </MDBRow>
      )}

      {/* Étape 3: Confirmation */}
      {etape === 3 && (
        <MDBRow>
          <MDBCol md="12">
            <MDBCardText>
              <strong>Service :</strong> {reservationDetails.service}
            </MDBCardText>
            <MDBCardText>
              <strong>Lieu :</strong> {space.location}
            </MDBCardText>
            <MDBCardText>
              <strong>Date :</strong> {reservationDetails.date}
            </MDBCardText>
            <MDBCardText>
              <strong>Durée :</strong> {reservationDetails.duree} h
            </MDBCardText>
            <MDBCardText>
              <strong>Participants :</strong> {reservationDetails.participants}
            </MDBCardText>
            <MDBCardText>
              <strong>Description :</strong>{" "}
              {reservationDetails.description || "Aucune"}
            </MDBCardText>
            <MDBCardText>
              <strong>Commentaires :</strong>{" "}
              {reservationDetails.commentaires || "Aucun"}
            </MDBCardText>
            <MDBCardText>
              <strong>Heure d'arrivée :</strong>{" "}
              {reservationDetails.heure_arrivee}
            </MDBCardText>
            <MDBCardText>
              <strong>Heure de départ :</strong>{" "}
              {reservationDetails.heure_depart}
            </MDBCardText>
            <MDBCardText>
              <strong>Montant à payer :</strong> {reservationDetails.montant} €
            </MDBCardText>
            <MDBCardText>
              <strong>Mode de paiement :</strong>{" "}
              {reservationDetails.mode_paiement}
            </MDBCardText>
            <MDBCardText>
              <strong>Rappels :</strong>
            </MDBCardText>
            <ul>
              {reservationDetails.rappels.length > 0 ? (
                reservationDetails.rappels.map((r, i) => (
                  <li key={i}>{new Date(r).toLocaleString()}</li>
                ))
              ) : (
                <li>Aucun</li>
              )}
            </ul>
          </MDBCol>
        </MDBRow>
      )}

      {/* Navigation entre les étapes */}
      <div className="d-flex justify-content-between mt-4">
        {etape > 1 && (
          <MDBBtn
            color="secondary"
            style={{ textTransform: "none" }}
            onClick={() => setEtape(etape - 1)}
            disabled={loading}
          >
            <MDBIcon icon="arrow-left" className="me-2" /> Précédent
          </MDBBtn>
        )}
        {etape < 3 ? (
          <MDBBtn
            style={{ textTransform: "none" }}
            onClick={() => {
              const formErrors = validateForm();
              if (Object.keys(formErrors).length === 0) {
                setEtape(etape + 1);
              } else {
                setErrors(formErrors);
              }
            }}
            disabled={loading}
          >
            Suivant <MDBIcon icon="arrow-right" className="ms-2" />
          </MDBBtn>
        ) : (
          <MDBBtn
            style={{ textTransform: "none" }}
            color="success"
            onClick={handleSubmitReservation}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                En cours...
              </>
            ) : (
              <>
                Confirmer la réservation{" "}
                <MDBIcon icon="check" className="ms-2" />
              </>
            )}
          </MDBBtn>
        )}
      </div>
    </MDBContainer>
  );
}

export default ReservationForm;
