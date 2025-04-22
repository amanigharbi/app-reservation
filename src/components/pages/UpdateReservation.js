import React, { useState, useEffect } from 'react';
import {
  MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle,
  MDBModalBody, MDBModalFooter, MDBInput, MDBBtn, MDBIcon, MDBBadge,
  MDBCardText, MDBRow, MDBCol
} from 'mdb-react-ui-kit';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import PaymentModal from './PaymentModal'; // Composant de paiement à créer

function UpdateReservation({ reservationId, onClose, showModal }) {
  const [reservation, setReservation] = useState({
    date: '',
    heure_arrivee: '',
    heure_depart: '',
    duree: 0,
    rappels: [],
    montantTotal: 0,
    montantDejaPaye: 0,
    montantSupplementaire: 0,
    spaceMontant: 0
  });

  const [nouveauRappel, setNouveauRappel] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDuree = (heuresDecimales) => {
    const totalMinutes = Math.round(parseFloat(heuresDecimales) * 60);
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (isNaN(heures)) return '';
    if (minutes === 0) return `${heures}h`;
    return `${heures}h ${minutes}min`;
  };

  // Chargement initial
  useEffect(() => {
    const loadData = async () => {
      const docRef = doc(db, "reservations", reservationId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setReservation({
          ...data,
          montantDejaPaye: data.montant || 0,
          montantSupplementaire: 0,
          montantTotal: data.montant || 0
        });
      }
    };
    if (reservationId) loadData();
  }, [reservationId]);

  // Calcul des montants et vérification disponibilité
  useEffect(() => {
    if (reservation.heure_arrivee && reservation.heure_depart) {
      const [h1, m1] = reservation.heure_arrivee.split(':').map(Number);
      const [h2, m2] = reservation.heure_depart.split(':').map(Number);
      const nouvelleDuree = ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
      const supplement = Math.max(0, (nouvelleDuree - reservation.duree) * reservation.spaceMontant);

      setReservation(prev => ({
        ...prev,
        duree: nouvelleDuree,
        montantSupplementaire: supplement,
        montantTotal: prev.montantDejaPaye + supplement
      }));

      // Vérification simplifiée de la disponibilité
      setDisponible(true); // Implémentez une vraie vérification ici
    }
  }, [reservation.heure_arrivee, reservation.heure_depart]);

  const handleSubmit = async () => {
    if (reservation.montantSupplementaire > 0) {
      setShowPaymentModal(true);
    } else {
      await saveReservation();
    }
  };

  const saveReservation = async (paiement = null) => {
    setLoading(true);
    try {
      const updateData = {
        ...reservation,
        duree: parseFloat(reservation.duree),
        montant: parseFloat(reservation.montantTotal),
        rappels: [...reservation.rappels]
      };

      if (paiement) {
        updateData.paiements = [
          ...(reservation.paiements || []),
          {
            montant: reservation.montantSupplementaire,
            date: new Date().toISOString(),
            methode: paiement.methode,
            transactionId: paiement.transactionId
          }
        ];
      }

      await updateDoc(doc(db, "reservations", reservationId), updateData);
      onClose(true);
    } catch (error) {
      console.error("Erreur mise à jour:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentResult) => {
    setShowPaymentModal(false);
    saveReservation(paymentResult);
  };

  return (
    <>
      <MDBModal open={showModal} onClose={() => onClose(false)}>
        <MDBModalDialog size='lg'>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Modifier Réservation</MDBModalTitle>
            </MDBModalHeader>

            <MDBModalBody>
              <MDBRow>
                <MDBCol md={6}>
                  <MDBInput
                    label='Date'
                    type='date'
                    value={reservation.date}
                    onChange={e => setReservation({ ...reservation, date: e.target.value })}
                  />
                </MDBCol>
                <MDBCol md={3}>
                  <MDBInput
                    label='Heure arrivée'
                    type='time'
                    value={reservation.heure_arrivee}
                    onChange={e => setReservation({ ...reservation, heure_arrivee: e.target.value })}
                  />
                </MDBCol>
                <MDBCol md={3}>
                  <MDBInput
                    label='Heure départ'
                    type='time'
                    value={reservation.heure_depart}
                    onChange={e => setReservation({ ...reservation, heure_depart: e.target.value })}
                  />
                </MDBCol>
              </MDBRow>

              <div className='mt-4 p-3 bg-light rounded'>
                <MDBCardText><strong>Durée:</strong> {formatDuree(reservation.duree)}</MDBCardText>
                <MDBCardText><strong>Déjà payé:</strong> {reservation.montantDejaPaye}€</MDBCardText>
                {reservation.montantSupplementaire > 0 && (
                  <MDBCardText className='text-warning'>
                    <strong>Supplément à payer:</strong> {reservation.montantSupplementaire.toFixed(2)}€
                  </MDBCardText>
                )}
                <MDBCardText className='fw-bold'>
                  <strong>Total:</strong> {reservation.montantTotal.toFixed(2)}€
                </MDBCardText>
              </div>

              <div className='mt-4'>
                <h6>Ajouter un rappel</h6>
                <div className='d-flex align-items-center'>
                  <MDBInput
                    value={nouveauRappel}
                    onChange={e => setNouveauRappel(e.target.value)}
                    placeholder='Date et heure du rappel'
                  />
                  <MDBBtn
                    color='primary'
                    size='sm'
                    className='ms-2'
                    onClick={() => {
                      if (nouveauRappel) {
                        setReservation({
                          ...reservation,
                          rappels: [...reservation.rappels, nouveauRappel]
                        });
                        setNouveauRappel('');
                      }
                    }}
                  >
                    <MDBIcon icon='plus' />
                  </MDBBtn>
                </div>
                <div className='mt-2'>
                  {reservation.rappels.map((rappel, index) => (
                    <MDBBadge key={index} color='info' className='me-2 mb-2'>
                      {rappel}
                    </MDBBadge>
                  ))}
                </div>
              </div>
            </MDBModalBody>

            <MDBModalFooter>
              <MDBBtn color='secondary' onClick={() => onClose(false)}>
                Annuler
              </MDBBtn>
              <MDBBtn
                color='primary'
                onClick={handleSubmit}
                disabled={!disponible || loading}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <PaymentModal
          show={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={reservation.montantSupplementaire}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}

export default UpdateReservation;