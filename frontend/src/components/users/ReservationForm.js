import React, { useState, useEffect, useCallback } from "react";
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
import "../styles/Pages.css";
import { useTranslation } from "react-i18next";

function ReservationForm({ space }) {
  const { t } = useTranslation();

  const [etape, setEtape] = useState(1);
  const [nouveauRappel, setNouveauRappel] = useState("");
  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line
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
  // eslint-disable-next-line
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedStartSlot, setSelectedStartSlot] = useState(null);
  const [selectedEndSlot, setSelectedEndSlot] = useState(null);
  // eslint-disable-next-line
  const [bookedSlots, setBookedSlots] = useState([]);

  const [reservedSlots, setReservedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  useEffect(() => {
    const fetchReservations = async () => {
      if (reservationDetails.date && spaceDetails.id) {
        setLoadingSlots(true);
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/protected/reservations`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const matching = response.data.reservations.filter(
            (res) =>
              res.date === reservationDetails.date &&
              res.spaceId === spaceDetails.id &&
              !["annulée", "refusée"].includes(res.status)
          );

          setReservedSlots(
            matching.map((res) => ({
              start: res.heure_arrivee,
              end: res.heure_depart,
            }))
          );
        } catch (error) {
          console.error("Erreur chargement réservations:", error);
        } finally {
          setLoadingSlots(false);
        }
      }
    };

    fetchReservations();
  }, [reservationDetails.date, spaceDetails.id]);

  const isSlotAvailable = useCallback(
    (time) => {
      const [h, m] = time.split(":").map(Number);
      const t = h * 60 + m;
      return !reservedSlots.some(({ start, end }) => {
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        const s = sh * 60 + sm,
          e = eh * 60 + em;
        return t >= s && t < e + 15;
      });
    },
    [reservedSlots]
  );

  const generateTimeSlots = useCallback(() => {
    if (!spaceDetails.availableFrom || !spaceDetails.availableTo) return [];
    const [oh, om] = spaceDetails.availableFrom.split(":").map(Number);
    const [ch, cm] = spaceDetails.availableTo.split(":").map(Number);
    let h = oh,
      m = om,
      slots = [];
    while (h < ch || (h === ch && m < cm)) {
      const t = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
      slots.push({ time: t, available: isSlotAvailable(t) });
      m += 15;
      if (m >= 60) {
        h++;
        m -= 60;
      }
    }
    return slots;
  }, [spaceDetails.availableFrom, spaceDetails.availableTo, isSlotAvailable]);

  useEffect(() => {
    setAvailableSlots(generateTimeSlots());
  }, [
    generateTimeSlots,
    reservationDetails.date,
    reservationDetails.heure_arrivee,
    reservationDetails.heure_depart,
  ]);

  useEffect(() => {
    if (selectedStartSlot && selectedEndSlot) {
      setReservationDetails((prev) => ({
        ...prev,
        heure_arrivee: selectedStartSlot,
        heure_depart: selectedEndSlot,
      }));
    }
  }, [selectedStartSlot, selectedEndSlot]);

  useEffect(() => {
    const { heure_arrivee, heure_depart } = reservationDetails;
    if (heure_arrivee && heure_depart) {
      const [h1, m1] = heure_arrivee.split(":").map(Number);
      const [h2, m2] = heure_depart.split(":").map(Number);
      const debut = h1 * 60 + m1;
      const fin = h2 * 60 + m2;
      if (fin > debut) {
        const dureeHeures = ((fin - debut) / 60).toFixed(2);
        setReservationDetails((prev) => ({ ...prev, duree: dureeHeures }));
      }
    }
    // eslint-disable-next-line
  }, [reservationDetails.heure_arrivee, reservationDetails.heure_depart]);

  useEffect(() => {
    const d = parseFloat(reservationDetails.duree);
    const m = parseFloat(spaceDetails?.montant || 0);
    if (!isNaN(d) && !isNaN(m)) {
      setReservationDetails((prev) => ({
        ...prev,
        montant: (d * m).toFixed(2),
      }));
    }
  }, [reservationDetails.duree, spaceDetails?.montant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReservationDetails({ ...reservationDetails, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
  
    if (etape === 1) {
      if (!reservationDetails.service)
        newErrors.service = t("service_required");
      if (!reservationDetails.date) newErrors.date = t("date_required");
      if (!reservationDetails.participants)
        newErrors.participants = t("part_required");
  
      // Vérification capacité max
      const participants = parseInt(reservationDetails.participants, 10);
      const maxCapacity = parseInt(spaceDetails.capacity || 0, 10);
  
      if (!isNaN(participants) && participants > maxCapacity) {
        newErrors.participants = `${t("participantsExceeded")} (${maxCapacity})`;
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
          newErrors.heure_arrivee = `${t(
            "heureArriveeDepart_1"
          )} ${availableFrom} ${t("heureArriveeDepart_2")} ${availableTo}`;
          newErrors.heure_depart = `${t(
            "heureArriveeDepart_1"
          )} ${availableFrom} ${t("heureArriveeDepart_2")} ${availableTo}`;
        }
      }
    }
  
    if (etape === 2 && !reservationDetails.mode_paiement) {
      newErrors.mode_paiement = t("pay_required");
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

        await axios.post(
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
          message: t("success_created"),
        });

        setTimeout(() => {
          navigate("/mes-reservations");
        }, 2000);
      } catch (error) {
        console.error(t("error_created"), error);
        setShowToast({
          type: "error",
          visible: true,
          message: error.response?.data?.message || t("error_created"),
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
            <span className="visually-hidden">{t("loading")}</span>
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
            <b>{t("title_res_space")} :</b> {spaceDetails.name}
          </h4>
          <MDBCardText>
            <strong>{t("location")} :</strong> {spaceDetails.location}
          </MDBCardText>
          <MDBCardText>
            <strong>{t("dispo")} :</strong> {spaceDetails.availableFrom} -{" "}
            {spaceDetails.availableTo}
          </MDBCardText>
          <MDBCardText>
            <strong>{t("tarif")} :</strong> {spaceDetails.montant} {t("eur_h")}
          </MDBCardText>
          <MDBCardText>
            <strong>{t("capacity")} :</strong> {spaceDetails.capacity} {t("per")}
          </MDBCardText>
        </div>
      )}

      {/* Étape 1: Détails de la réservation */}
      {etape === 1 && (
        <MDBRow>
          <MDBCol md="6" className="mb-4">
            <MDBInput
              label={t("service")}
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
              label={t("participants")}
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
              label={t("date")}
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
              label={t("duration") + " "+ t("perH")}
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

          <TimeSlotSelector
            label={t("arrival")}
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
            label={t("departure")}
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
              label={t("description")}
              name="description"
              value={reservationDetails.description}
              onChange={handleChange}
            />
          </MDBCol>
          <MDBCol md="12" className="mb-4">
            <MDBInput
              label={t("comments")}
              name="commentaires"
              value={reservationDetails.commentaires}
              onChange={handleChange}
            />
          </MDBCol>
          <MDBCol md="12" className="mb-4">
            <MDBInput
              label={t("add_rappel_label")}
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
              {t("add_rappel")}{" "}
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
            <label className="form-label">{t("payment")}</label>
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
              <option value="carte">{t("credit")}</option>
              <option value="paypal">{t("paypal")}</option>
              <option value="virement">{t("vir")}</option>
            </select>

            {paymentMethod === "carte" && (
              <>
                <MDBInput
                  label={t("number_card")}
                  value={cardDetails.number}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, number: e.target.value })
                  }
                  className="mb-2"
                />
                <div className="d-flex mb-3">
                  <MDBInput
                    label={t("exp_date")}
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
                    label={t("cvv")}
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cvv: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            <MDBCardText className="mt-3">
              <strong>{t("amount_paid")}</strong>{" "}
              {reservationDetails.montant
                ? `${Number(reservationDetails.montant).toLocaleString(
                    "fr-FR"
                  )} €`
                : t("not_specified")}
            </MDBCardText>
          </MDBCol>
        </MDBRow>
      )}

      {/* Étape 3: Confirmation */}
      {etape === 3 && (
        <MDBRow>
          <MDBCol md="12">
            <MDBCardText>
              <strong>{t("service")} :</strong> {reservationDetails.service}
            </MDBCardText>
            <MDBCardText>
              <strong>{t("location")} :</strong> {space.location}
            </MDBCardText>
            <MDBCardText>
              <strong>{t("date")} :</strong> {reservationDetails.date}
            </MDBCardText>
            <MDBCardText>
              <strong>{t("duration")} :</strong> {reservationDetails.duree} h
            </MDBCardText>
            <MDBCardText>
              <strong>{t("participants")} :</strong> {reservationDetails.participants}
            </MDBCardText>
            <MDBCardText>
              <strong>{t("description")} :</strong>{" "}
              {reservationDetails.description || t("auc")}
            </MDBCardText>
            <MDBCardText>
              <strong>{t("comments")} :</strong>{" "}
              {reservationDetails.commentaires || t("auc")}
            </MDBCardText>
            <MDBCardText>
              <strong>{t("arrival")} :</strong>{" "}
              {reservationDetails.heure_arrivee}
            </MDBCardText>
            <MDBCardText>
              <strong>{t("departure")} :</strong>{" "}
              {reservationDetails.heure_depart}
            </MDBCardText>
            <MDBCardText>
              <strong>{t("amount_paid")}</strong> {reservationDetails.montant} €
            </MDBCardText>
            <MDBCardText>
              <strong>{t("payment")} :</strong>{" "}
              {reservationDetails.mode_paiement}
            </MDBCardText>
            <MDBCardText>
              <strong>{t("remind")} :</strong>
            </MDBCardText>
            <ul>
              {reservationDetails.rappels.length > 0 ? (
                reservationDetails.rappels.map((r, i) => (
                  <li key={i}>{new Date(r).toLocaleString()}</li>
                ))
              ) : (
                <li>{t("auc")}</li>
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
            <MDBIcon icon="arrow-left" className="me-2" /> {t("prev")}
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
            {t("next")} <MDBIcon icon="arrow-right" className="ms-2" />
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
                {t("en_cr")}
              </>
            ) : (
              <>
                {t("conf_res")}{" "}
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
