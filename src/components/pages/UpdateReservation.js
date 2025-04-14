import React, { useEffect, useState } from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBBtn,
  MDBCardText,
  MDBBadge,
  MDBIcon,
} from "mdb-react-ui-kit";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";

function UpdateReservation({ space }) {
  const { id } = useParams(); // ID de la réservation à modifier
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [nouveauRappel, setNouveauRappel] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const docRef = doc(db, "reservations", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setReservation(docSnap.data());
        } else {
          console.error("Réservation non trouvée");
        }
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
      }
    };
    fetchReservation();
  }, [id]);

  useEffect(() => {
    if (reservation?.heure_arrivee && reservation?.heure_depart) {
      const [h1, m1] = reservation.heure_arrivee.split(":").map(Number);
      const [h2, m2] = reservation.heure_depart.split(":").map(Number);
      const start = h1 * 60 + m1;
      const end = h2 * 60 + m2;
      if (end > start) {
        const dureeHeures = ((end - start) / 60).toFixed(2);
        setReservation((prev) => ({
          ...prev,
          duree: dureeHeures,
        }));
      }
    }
  }, [reservation?.heure_arrivee, reservation?.heure_depart]);

  useEffect(() => {
    const duree = parseFloat(reservation?.duree);
    const montantParHeure = parseFloat(space?.montant || 0);

    if (!isNaN(duree) && !isNaN(montantParHeure)) {
      const total = duree * montantParHeure;
      setReservation((prev) => ({
        ...prev,
        montant: total.toFixed(2),
      }));
    }
  }, [reservation?.duree, space]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReservation({ ...reservation, [name]: value });
  };

  const validate = () => {
    const errs = {};
    if (!reservation.service) errs.service = "Service requis";
    if (!reservation.date) errs.date = "Date requise";
    if (!reservation.participants) errs.participants = "Nombre de participants requis";
    if (!reservation.heure_arrivee || !reservation.heure_depart)
      errs.heure = "Heures d'arrivée et départ requises";

    return errs;
  };

  const handleUpdate = async () => {
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const docRef = doc(db, "reservations", id);
      await updateDoc(docRef, reservation);
      setSuccess(true);
      setTimeout(() => navigate("/mes-reservations"), 2000);
    } catch (err) {
      console.error("Erreur mise à jour:", err);
    }
  };

  if (!reservation) return <p>Chargement...</p>;

  return (
    <MDBContainer className="py-4">
      <h4 className="mb-4">Modifier la réservation</h4>

      <MDBRow>
        <MDBCol md="6">
          <MDBInput
            label="Service"
            name="service"
            value={reservation.service}
            onChange={handleChange}
            invalid={!!errors.service}
          />
        </MDBCol>
        <MDBCol md="6">
          <MDBInput
            label="Participants"
            name="participants"
            value={reservation.participants}
            onChange={handleChange}
            invalid={!!errors.participants}
          />
        </MDBCol>
        <MDBCol md="6">
          <MDBInput
            label="Date"
            name="date"
            type="datetime-local"
            value={reservation.date}
            onChange={handleChange}
            invalid={!!errors.date}
          />
        </MDBCol>
        <MDBCol md="6">
          <MDBInput
            label="Durée (heures)"
            name="duree"
            value={reservation.duree}
            disabled
          />
        </MDBCol>
        <MDBCol md="6">
          <MDBInput
            label="Heure d'arrivée"
            name="heure_arrivee"
            type="time"
            value={reservation.heure_arrivee}
            onChange={handleChange}
          />
        </MDBCol>
        <MDBCol md="6">
          <MDBInput
            label="Heure de départ"
            name="heure_depart"
            type="time"
            value={reservation.heure_depart}
            onChange={handleChange}
          />
        </MDBCol>
        <MDBCol md="12">
          <MDBInput
            label="Commentaires"
            name="commentaires"
            value={reservation.commentaires}
            onChange={handleChange}
          />
        </MDBCol>
        <MDBCol md="12">
          <MDBInput
            label="Ajouter un rappel"
            type="datetime-local"
            value={nouveauRappel}
            onChange={(e) => setNouveauRappel(e.target.value)}
          />
          <MDBBtn
            size="sm"
            className="mt-2"
            onClick={() => {
              if (nouveauRappel) {
                setReservation((prev) => ({
                  ...prev,
                  rappels: [...(prev.rappels || []), nouveauRappel],
                }));
                setNouveauRappel("");
              }
            }}
          >
            Ajouter un rappel
          </MDBBtn>
          <div className="mt-3 d-flex flex-wrap">
            {(reservation.rappels || []).map((r, i) => (
              <MDBBadge key={i} color="info" className="me-2 mb-2">
                {new Date(r).toLocaleString()}
              </MDBBadge>
            ))}
          </div>
        </MDBCol>
        <MDBCol md="12">
          <MDBCardText className="mt-3">
            <strong>Montant calculé :</strong>{" "}
            {reservation.montant
              ? `${Number(reservation.montant).toLocaleString("fr-FR")} €`
              : "Non défini"}
          </MDBCardText>
        </MDBCol>
      </MDBRow>

      <div className="d-flex justify-content-between mt-4">
        <MDBBtn color="secondary" onClick={() => navigate(-1)}>
          <MDBIcon icon="arrow-left" className="me-2" />
          Annuler
        </MDBBtn>
        <MDBBtn color="success" onClick={handleUpdate}>
          <MDBIcon icon="save" className="me-2" />
          Enregistrer
        </MDBBtn>
      </div>

      {success && (
        <div className="alert alert-success mt-4">
          Réservation mise à jour avec succès !
        </div>
      )}
    </MDBContainer>
  );
}

export default UpdateReservation;
