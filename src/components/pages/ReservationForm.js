import React, { useState, useEffect } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBIcon, MDBCardText } from 'mdb-react-ui-kit';
import { addDoc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth'; // Importer l'authentification Firebase

function ReservationForm({ space }) {
  const [etape, setEtape] = useState(1);
  const [reservationDetails, setReservationDetails] = useState({
    service: '',
    lieu: '',
    date: '',
    duree: '',
    participants: '',
    description: '',
    commentaires: '',
    mode_paiement: '',
    spaceId: space?.id,
    spaceName: space?.name,
    spaceLocation: space?.location,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  // Récupérer l'ID de l'utilisateur connecté
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid); // Définir l'ID utilisateur
    } else {
      console.error('Utilisateur non connecté');
      // Vous pouvez rediriger vers la page de connexion si nécessaire
      navigate('/login'); 
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReservationDetails({ ...reservationDetails, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (etape === 1) {
      if (!reservationDetails.service) newErrors.service = "Le service est requis";
      if (!reservationDetails.lieu) newErrors.lieu = "Le lieu est requis";
      if (!reservationDetails.date) newErrors.date = "La date est requise";
      if (!reservationDetails.duree) newErrors.duree = "La durée est requise";
      if (!reservationDetails.participants) newErrors.participants = "Le nombre de participants est requis";
    }
    if (etape === 2 && !reservationDetails.mode_paiement) {
      newErrors.mode_paiement = "Le mode de paiement est requis";
    }
    return newErrors;
  };

  const handleSubmitReservation = async (e) => {
    e.preventDefault();

    // Validation du formulaire
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      try {
        // Vérifiez si userId est défini
        if (!userId) {
          throw new Error('L\'ID de l\'utilisateur est requis');
        }

        // Ajouter la réservation à Firestore avec userId au lieu de userEmail
        await addDoc(collection(db, 'reservations'), {
          spaceId: space.id,
          userId: userId, // Utilisation de userId
          ...reservationDetails,
          date: new Date(),
        });

        alert('Réservation réussie !');
        setEtape(1); // Réinitialiser l'étape pour revenir à la première étape après succès
        setReservationDetails({
          service: '',
          lieu: '',
          date: '',
          duree: '',
          participants: '',
          description: '',
          commentaires: '',
          mode_paiement: '',
        });
        navigate('/mes-reservations'); // Naviguer vers la page des réservations de l'utilisateur
      } catch (error) {
        console.error('Erreur lors de la réservation:', error);
        alert('Erreur lors de la réservation, réessaye plus tard.');
      }
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <MDBContainer className="py-5">
      {space && (
        <div className="justify-content-center text-center">
          <h4><b>Réservation pour l'espace :</b> {space.name}</h4>
          <MDBCardText><strong>Lieu :</strong> {space.location}</MDBCardText>
          <MDBCardText><strong>Disponible :</strong> {space.availableFrom} - {space.availableTo}</MDBCardText>
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
              feedback={errors.service}
            />
          </MDBCol>
          <MDBCol md="6" className="mb-4">
            <MDBInput
              label="Lieu"
              name="lieu"
              value={reservationDetails.lieu}
              onChange={handleChange}
              invalid={!!errors.lieu}
              feedback={errors.lieu}
            />
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
          </MDBCol>
          <MDBCol md="6" className="mb-4">
            <MDBInput
              label="Participants"
              name="participants"
              value={reservationDetails.participants}
              onChange={handleChange}
              invalid={!!errors.participants}
              feedback={errors.participants}
            />
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
            <p className="text-muted">Simulation de paiement - aucune transaction réelle</p>
          </MDBCol>
        </MDBRow>
      )}

      {etape === 3 && (
        <MDBRow>
          <MDBCol md="12" className="mb-4">
            <MDBCardText><strong>Service :</strong> {reservationDetails.service}</MDBCardText>
            <MDBCardText><strong>Lieu :</strong> {reservationDetails.lieu}</MDBCardText>
            <MDBCardText><strong>Date :</strong> {reservationDetails.date}</MDBCardText>
            <MDBCardText><strong>Durée :</strong> {reservationDetails.duree} h</MDBCardText>
            <MDBCardText><strong>Participants :</strong> {reservationDetails.participants}</MDBCardText>
            <MDBCardText><strong>Commentaires :</strong> {reservationDetails.commentaires}</MDBCardText>
            <MDBCardText><strong>Mode de paiement :</strong> {reservationDetails.mode_paiement}</MDBCardText>
          </MDBCol>
        </MDBRow>
      )}

      <div className="d-flex justify-content-between mt-4">
        {etape > 1 && (
          <MDBBtn color="secondary" onClick={() => setEtape(etape - 1)}>
            <MDBIcon icon="arrow-left" className="me-2" style={{ textTransform: 'none' }} /> Précédent
          </MDBBtn>
        )}

        {etape < 3 && (
          <MDBBtn onClick={() => {
            const formErrors = validateForm();
            if (Object.keys(formErrors).length === 0) {
              setEtape(etape + 1);
            } else {
              setErrors(formErrors);
            }
          }}>
            Suivant <MDBIcon icon="arrow-right" className="ms-2" style={{ textTransform: 'none' }} />
          </MDBBtn>
        )}

        {etape === 3 && (
          <MDBBtn color="success" onClick={handleSubmitReservation}>
            Confirmer la réservation <MDBIcon icon="check" className="ms-2" />
          </MDBBtn>
        )}
      </div>
    </MDBContainer>
  );
}

export default ReservationForm;
