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
  MDBListGroup,
  MDBListGroupItem,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Pages.css";
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
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedStartSlot, setSelectedStartSlot] = useState(null);
  const [selectedEndSlot, setSelectedEndSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [reservedTimeSlots, setReservedTimeSlots] = useState([]);
  const [reservedSlots, setReservedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  // Ajoutez cet effet pour charger les créneaux réservés
  useEffect(() => {
    const fetchReservations = async () => {
      if (reservationDetails.date && spaceDetails.id) {
        setLoadingSlots(true);
        try {
          const token = localStorage.getItem("token");

          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/protected/reservations`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const allReservations = response.data.reservations;

          // ✅ Filtrer uniquement celles correspondant à la date sélectionnée
          const matchingReservations = allReservations.filter(
            (res) =>
              res.date === reservationDetails.date &&
              res.spaceId === spaceDetails.id &&
              res.status !== "annulée" &&
              res.status !== "refusée"
          );

          const slots = matchingReservations.map((res) => ({
            start: res.heure_arrivee,
            end: res.heure_depart,
          }));

          setReservedSlots(slots);
        } catch (error) {
          console.error("Erreur chargement réservations:", error);
        } finally {
          setLoadingSlots(false);
        }
      }
    };

    fetchReservations();
  }, [reservationDetails.date, spaceDetails.id]);
  const isSlotAvailable = (time) => {
    // Convertir l'heure en minutes pour faciliter la comparaison
    const [hours, minutes] = time.split(":").map(Number);
    const slotMinutes = hours * 60 + minutes;

    // Vérifier chaque réservation existante
    return !reservedSlots.some((reservation) => {
      const [resStartH, resStartM] = reservation.start.split(":").map(Number);
      const [resEndH, resEndM] = reservation.end.split(":").map(Number);
      const resStart = resStartH * 60 + resStartM;
      const resEnd = resEndH * 60 + resEndM;

      return slotMinutes >= resStart && slotMinutes < resEnd + 15;
    });
  };
  // Modifiez la fonction generateTimeSlots
  const generateTimeSlots = () => {
    const slots = [];
    const [openHour, openMinute] = spaceDetails.availableFrom
      .split(":")
      .map(Number);
    const [closeHour, closeMinute] = spaceDetails.availableTo
      .split(":")
      .map(Number);

    let currentHour = openHour;
    let currentMinute = openMinute;

    while (
      currentHour < closeHour ||
      (currentHour === closeHour && currentMinute < closeMinute)
    ) {
      const time = `${currentHour.toString().padStart(2, "0")}:${currentMinute
        .toString()
        .padStart(2, "0")}`;

      // ❗ Correction ici : on utilise isSlotAvailable(time) qui utilise reservedSlots
      slots.push({
        time,
        available: isSlotAvailable(time),
      });

      currentMinute += 15;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute -= 60;
      }
    }

    return slots;
  };

  // Générer les créneaux disponibles lorsque la date ou les réservations changent
  useEffect(() => {
    if (spaceDetails.availableFrom && spaceDetails.availableTo) {
      setAvailableSlots(generateTimeSlots());
    }
  }, [spaceDetails, bookedSlots, reservationDetails.date]);

  // Mettre à jour les heures de réservation lorsqu'un créneau est sélectionné
  useEffect(() => {
    if (selectedStartSlot && selectedEndSlot) {
      setReservationDetails((prev) => ({
        ...prev,
        heure_arrivee: selectedStartSlot,
        heure_depart: selectedEndSlot,
      }));
    }
  }, [selectedStartSlot, selectedEndSlot]);
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

      // Vérification capacité max
      const participants = parseInt(reservationDetails.participants, 10);
      const maxCapacity = parseInt(spaceDetails.capacity || 0, 10);

      if (!isNaN(participants) && participants > maxCapacity) {
        newErrors.participants = `Le nombre de participants dépasse la capacité maximale (${maxCapacity})`;
      }
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
  const TimeSlotSelector = ({ label, value, onChange, availableSlots }) => (
    <MDBCol md="6" className="mb-4">
      <label className="form-label">{label}</label>
      {loadingSlots ? (
        <div className="text-center py-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <div className="time-slots-grid">
          {availableSlots.map((slot, index) => {
            const isAvailable = isSlotAvailable(slot.time);
            return (
              <button
                key={`${label}-${index}`}
                type="button"
                className={`time-slot ${
                  value === slot.time ? "selected" : ""
                } ${!isAvailable ? "disabled" : ""}`}
                disabled={!isAvailable}
                onClick={() => isAvailable && onChange(slot.time)}
              >
                {slot.time}
              </button>
            );
          })}
        </div>
      )}
      {errors[`heure_${label.toLowerCase()}`] && (
        <div className="text-danger small mt-1">
          {errors[`heure_${label.toLowerCase()}`]}
        </div>
      )}
    </MDBCol>
  );
  const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'

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
          <MDBCardText>
            <strong>Capacité :</strong> {spaceDetails.capacity} personnes
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
              min={today}
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

          {/* <MDBCol md="6" className="mb-4">
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
          </MDBCol> */}
          <TimeSlotSelector
            label="Arrivée"
            value={reservationDetails.heure_arrivee}
            onChange={(time) => {
              setReservationDetails((prev) => ({
                ...prev,
                heure_arrivee: time,
              }));
              setSelectedStartSlot(time);
              setSelectedEndSlot(null); // Réinitialiser l'heure de départ
            }}
            availableSlots={generateTimeSlots()}
          />

          <TimeSlotSelector
            label="Départ"
            value={reservationDetails.heure_depart}
            onChange={(time) => {
              setReservationDetails((prev) => ({
                ...prev,
                heure_depart: time,
              }));
              setSelectedEndSlot(time);
            }}
            availableSlots={generateTimeSlots().filter(
              (slot) => !selectedStartSlot || slot.time > selectedStartSlot
            )}
          />
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
