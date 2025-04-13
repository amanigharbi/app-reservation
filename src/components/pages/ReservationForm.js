import React, { useState, useEffect } from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBBtn,
  MDBIcon,
  MDBCardText,
} from "mdb-react-ui-kit";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";

function ReservationForm({ space }) {
  const [etape, setEtape] = useState(1);
  const [nouveauRappel, setNouveauRappel] = useState("");
  const [showToast, setShowToast] = useState({ type: "", visible: false });

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
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
    } else {
      console.error("Utilisateur non connecté");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReservationDetails({ ...reservationDetails, [name]: value });
  };
  useEffect(() => {
    const duree = parseFloat(reservationDetails.duree);
    const montantParHeure = parseFloat(space?.montant || 0);
  
    if (!isNaN(duree) && !isNaN(montantParHeure)) {
      const total = duree * montantParHeure;
      setReservationDetails((prev) => ({
        ...prev,
        montant: total.toFixed(2), // 2 décimales
      }));
    }
  }, [reservationDetails.duree, space]);
  

  const validateForm = () => {
    const newErrors = {};
    if (etape === 1) {
      if (!reservationDetails.service)
        newErrors.service = "Le service est requis";
      if (!reservationDetails.date) newErrors.date = "La date est requise";
      if (!reservationDetails.duree) newErrors.duree = "La durée est requise";
      if (!reservationDetails.participants)
        newErrors.participants = "Le nombre de participants est requis";
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
      try {
        if (!userId) throw new Error("L'ID de l'utilisateur est requis");

        const codeReservation = `RES-${Date.now()}`;
        const currentDate = new Date();

        await addDoc(collection(db, "reservations"), {
          ...reservationDetails,
          utilisateurId: userId,
          code_reservation: codeReservation,
          statut: "En attente",
          createdAt: currentDate.toISOString(),
          date: reservationDetails.date || currentDate.toISOString(),
        });
        setShowToast({ type: "success", visible: true });
        setTimeout(() => setShowToast({ type: "", visible: false }), 2000);
        setEtape(1);
        setReservationDetails({
          service: "",
          lieu: "",
          date: "",
          duree: "",
          participants: "",
          description: "",
          commentaires: "",
          mode_paiement: "",
          heure_arrivee: "",
          heure_depart: "",
          rappels: [],
          spaceId: space?.id || "",
          spaceName: space?.name || "",
          spaceLocation: space?.location || "",
          spaceMontant: space?.montant || "",
        });
        setNouveauRappel("");
        setTimeout(() => {
          navigate("/mes-reservations"); // Redirection après 5 sec
        }, 2000);
      } catch (error) {
        console.error("Erreur lors de la réservation:", error);
        setShowToast({ type: "error", visible: true });
        setTimeout(() => setShowToast({ type: "", visible: false }), 5000);
      }
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <MDBContainer className="py-5">
      {/* ✅ TOAST SUCCÈS & ERREUR */}
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
            aria-live="assertive"
            aria-atomic="true"
          >
            <div
              className={`toast-header ${
                showToast.type === "success" ? "bg-success" : "bg-danger"
              } text-white`}
            >
              <i
                className={`fas ${
                  showToast.type === "success" ? "fa-check" : "fa-times"
                } fa-lg me-2`}
              ></i>
              <strong className="me-auto">
                {showToast.type === "success" ? "Succès" : "Erreur"}
              </strong>
              <small>
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowToast({ type: "", visible: false })}
              ></button>
            </div>
            <div className="toast-body">
              {showToast.type === "success"
                ? "Réservation réussie !"
                : "Une erreur est survenue. Veuillez réessayer."}
            </div>
          </div>
        </div>
      )}
      {space && (
        <div className="text-center">
          <h4>
            <b>Réservation pour l'espace :</b> {space.name}
          </h4>
          <MDBCardText>
            <strong>Lieu :</strong> {space.location}
          </MDBCardText>
          <MDBCardText>
            <strong>Disponible :</strong> {space.availableFrom} -{" "}
            {space.availableTo}
          </MDBCardText>
          <br></br>
        </div>
      )}

      {etape === 1 && (
        <MDBRow>
          <MDBCol md="6" className="mb-4">
            <MDBInput
              label="Service"
              name="service"
              value={reservationDetails.service}
              onChange={handleChange}
              invalid={!!errors.service}
            />
            {errors.service && (
              <div
                className="invalid-feedback d-block"
                style={{ fontSize: "0.875rem", marginTop: "0.15rem" }}
              >
                {errors.service}
              </div>
            )}
            <br />
          </MDBCol>
          <MDBCol md="6" className="mb-4">
            <MDBInput
              label="Participants"
              name="participants"
              value={reservationDetails.participants}
              onChange={handleChange}
              invalid={!!errors.participants}
            />
            {errors.participants && (
              <div
                className="invalid-feedback d-block"
                style={{ fontSize: "0.875rem", marginTop: "0.15rem" }}
              >
                {errors.participants}
              </div>
            )}
            <br />
          </MDBCol>
          <MDBCol md="6" className="mb-4">
            <MDBInput
              label="Date (YYYY-MM-DD HH:mm)"
              name="date"
              value={reservationDetails.date}
              onChange={handleChange}
              invalid={!!errors.date}
              feedback={errors.date}
              type="datetime-local"
            />

            {errors.date && (
              <div
                className="invalid-feedback d-block"
                style={{ fontSize: "0.875rem", marginTop: "0.15rem" }}
              >
                {errors.date}
              </div>
            )}
            <br />
          </MDBCol>
          <MDBCol md="6" className="mb-4">
            <MDBInput
              label="Durée (en heures)"
              name="duree"
              value={reservationDetails.duree}
              onChange={handleChange}
              invalid={!!errors.duree}
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
          </MDBCol>
          <MDBCol md="6" className="mb-4">
            <MDBInput
              label="Heure de départ"
              type="time"
              name="heure_depart"
              value={reservationDetails.heure_depart}
              onChange={handleChange}
            />
            <br />
          </MDBCol>
          <MDBCol md="12" className="mb-4">
            <MDBInput
              label="Description"
              name="description"
              value={reservationDetails.description}
              onChange={handleChange}
            />
            <br />
          </MDBCol>
          <MDBCol md="12" className="mb-4">
            <MDBInput
              label="Commentaires"
              name="commentaires"
              value={reservationDetails.commentaires}
              onChange={handleChange}
            />
            <br />
          </MDBCol>
          <MDBCol md="12" className="mb-3">
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
                  setNouveauRappel("");
                }
              }}
            >
              Ajouter un rappel
            </MDBBtn>
            <ul className="mt-2">
              {reservationDetails.rappels.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </MDBCol>
        </MDBRow>
      )}

      {etape === 2 && (
        <MDBRow>
          <MDBCol md="12" className="mb-4">
            <MDBInput
              label="Mode de paiement (ex: Carte de crédit)"
              name="mode_paiement"
              value={reservationDetails.mode_paiement}
              onChange={handleChange}
              invalid={!!errors.mode_paiement}
              feedback={errors.mode_paiement}
            />
            {errors.mode_paiement && (
              <div
                className="invalid-feedback d-block"
                style={{ fontSize: "0.875rem", marginTop: "0.15rem" }}
              >
                {errors.mode_paiement}
              </div>
            )}
            <br />
            <p className="text-muted">
              Simulation de paiement - aucune transaction réelle
            </p>
            <MDBCardText className="mt-3">
  <strong>Montant à payer :</strong>{" "}
  {reservationDetails.montant
    ? `${Number(reservationDetails.montant).toLocaleString("fr-FR")} €`
    : "Non spécifié"}
</MDBCardText>
          </MDBCol>
        </MDBRow>
      )}

      {etape === 3 && (
        <MDBRow>
          <MDBCol md="12">
            <MDBCardText>
              <strong>Service :</strong> {reservationDetails.service}
            </MDBCardText>
            <MDBCardText>
              <strong>Lieu :</strong> {space.lieu}
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
              <strong>Description :</strong> {reservationDetails.description}
            </MDBCardText>
            <MDBCardText>
              <strong>Commentaires :</strong> {reservationDetails.commentaires}
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
              {reservationDetails.rappels.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </MDBCol>
        </MDBRow>
      )}

      <div className="d-flex justify-content-between mt-4">
        {etape > 1 && (
          <MDBBtn
            color="secondary"
            style={{ textTransform: "none" }}
            onClick={() => setEtape(etape - 1)}
          >
            <MDBIcon icon="arrow-left" className="me-2" /> Précédent
          </MDBBtn>
        )}
        {etape < 3 && (
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
          >
            Suivant <MDBIcon icon="arrow-right" className="ms-2" />
          </MDBBtn>
        )}
        {etape === 3 && (
          <MDBBtn
            color="success"
            style={{ textTransform: "none" }}
            onClick={handleSubmitReservation}
          >
            Confirmer la réservation <MDBIcon icon="check" className="ms-2" />
          </MDBBtn>
        )}
      </div>
    </MDBContainer>
  );
}

export default ReservationForm;
