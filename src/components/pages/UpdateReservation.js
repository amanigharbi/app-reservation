import React, { useState, useEffect } from 'react';
import {
  MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader,
  MDBModalTitle, MDBModalBody, MDBModalFooter, MDBInput,
  MDBBtn, MDBIcon, MDBBadge, MDBCardText, MDBRow, MDBCol,
  MDBAccordion, MDBAccordionItem, MDBListGroup, MDBListGroupItem
} from 'mdb-react-ui-kit';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import PaymentModal from './PaymentModal';
import RefundModal from './RefundModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function UpdateReservation({ reservationId, onClose, showModal }) {
  const [reservation, setReservation] = useState({
    date: '',
    heure_arrivee: '',
    heure_depart: '',
    dureeInitiale: 0,
    dureeModifiee: 0,
    rappels: [],
    montantTotal: 0,
    montantDejaPaye: 0,
    montantSupplementaire: 0,
    montantRemboursable: 0,
    spaceMontant: 0,
    statut: 'confirmée',
    modifications: []
  });

  const [nouveauRappel, setNouveauRappel] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [actionType, setActionType] = useState('update');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'PPpp', { locale: fr });
  };

  const formatDuree = (heuresDecimales) => {
    const totalMinutes = Math.round(parseFloat(heuresDecimales) * 60);
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${heures}h${minutes > 0 ? ` ${minutes}min` : ''}`;
  };

  // Chargement initial
  useEffect(() => {
    const loadData = async () => {
      try {
        const docRef = doc(db, "reservations", reservationId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setReservation({
            ...data,
            dureeInitiale: data.duree || 0,
            dureeModifiee: data.duree || 0,
            montantDejaPaye: data.montant || 0,
            montantSupplementaire: 0,
            montantRemboursable: 0,
            montantTotal: data.montant || 0,
            modifications: data.modifications || []
          });
        }
      } catch (err) {
        setError("Erreur lors du chargement de la réservation");
        console.error(err);
      }
    };
    
    if (reservationId) loadData();
  }, [reservationId]);

  // Calcul des montants
  useEffect(() => {
    if (reservation.heure_arrivee && reservation.heure_depart) {
      const [h1, m1] = reservation.heure_arrivee.split(':').map(Number);
      const [h2, m2] = reservation.heure_depart.split(':').map(Number);
      
      if (h2 * 60 + m2 <= h1 * 60 + m1) {
        setError("L'heure de départ doit être après l'heure d'arrivée");
        setDisponible(false);
        return;
      }

      const nouvelleDuree = ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
      const differenceDuree = nouvelleDuree - reservation.dureeInitiale;
      
      let supplement = 0;
      let remboursement = 0;

      if (differenceDuree > 0) {
        supplement = differenceDuree * reservation.spaceMontant;
      } else {
        remboursement = Math.abs(differenceDuree) * reservation.spaceMontant;
      }

      setReservation(prev => ({
        ...prev,
        dureeModifiee: nouvelleDuree,
        montantSupplementaire: supplement,
        montantRemboursable: remboursement,
        montantTotal: Math.max(0, prev.montantDejaPaye + supplement - remboursement)
      }));

      setError('');
      setDisponible(true);
    }
  }, [reservation.heure_arrivee, reservation.heure_depart]);

  const handleSubmit = async () => {
    if (reservation.montantSupplementaire > 0) {
      setActionType('update');
      setShowPaymentModal(true);
    } else if (reservation.montantRemboursable > 0) {
      setActionType('partial_cancel');
      setShowRefundModal(true);
    } else {
      await saveReservation();
    }
  };

  const saveReservation = async (transaction = null) => {
    setLoading(true);
    try {
      const modificationEntry = {
        date: new Date().toISOString(),
        type: actionType,
        ancienneDuree: reservation.dureeInitiale,
        nouvelleDuree: reservation.dureeModifiee,
        montantAjoute: reservation.montantSupplementaire,
        montantRembourse: reservation.montantRemboursable,
        ...(transaction && { transaction })
      };

      const updateData = {
        date: reservation.date,
        heure_arrivee: reservation.heure_arrivee,
        heure_depart: reservation.heure_depart,
        duree: parseFloat(reservation.dureeModifiee),
        montant: parseFloat(reservation.montantTotal),
        rappels: [...reservation.rappels],
        modifications: arrayUnion(modificationEntry)
      };

      if (transaction?.type === 'paiement') {
        updateData.paiements = arrayUnion({
          montant: reservation.montantSupplementaire,
          date: new Date().toISOString(),
          methode: transaction.methode,
          transactionId: transaction.transactionId
        });
      } else if (transaction?.type === 'remboursement') {
        updateData.remboursements = arrayUnion({
          montant: reservation.montantRemboursable,
          date: new Date().toISOString(),
          methode: transaction.methode,
          transactionId: transaction.transactionId
        });
      }

      await updateDoc(doc(db, "reservations", reservationId), updateData);
      onClose(true);
      // Ajouter un toast de succès ici
      alert("Réservation mise à jour avec succès !");
    } catch (error) {
      setError("Erreur lors de la mise à jour");
      console.error(error);
      // Ajouter un toast d'erreur ici
      alert("Une erreur est survenue lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentResult) => {
    setShowPaymentModal(false);
    saveReservation({ ...paymentResult, type: 'paiement' });
  };

  const handleRefundSuccess = (refundResult) => {
    setShowRefundModal(false);
    saveReservation({ ...refundResult, type: 'remboursement' });
  };

  return (
    <>
      <MDBModal open={showModal} onClose={() => onClose(false)} tabIndex="-1">
        <MDBModalDialog size='lg'>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Modifier Réservation</MDBModalTitle>
            </MDBModalHeader>

            <MDBModalBody>
              {error && <div className="alert alert-danger">{error}</div>}

              <MDBRow className='mb-3'>
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

              <div className='p-3 mb-4 bg-light rounded'>
                <MDBRow>
                  <MDBCol md={6}>
                    <MDBCardText><strong>Durée initiale:</strong> {formatDuree(reservation.dureeInitiale)}</MDBCardText>
                    <MDBCardText><strong>Nouvelle durée:</strong> {formatDuree(reservation.dureeModifiee)}</MDBCardText>
                  </MDBCol>
                  <MDBCol md={6}>
                    <MDBCardText><strong>Tarif horaire:</strong> {reservation.spaceMontant}€/h</MDBCardText>
                    <MDBCardText><strong>Déjà payé:</strong> {reservation.montantDejaPaye.toFixed(2)}€</MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol md={6}>
                    {reservation.montantSupplementaire > 0 && (
                      <MDBCardText className='text-warning'>
                        <strong>Supplément à payer:</strong> {reservation.montantSupplementaire.toFixed(2)}€
                      </MDBCardText>
                    )}
                    {reservation.montantRemboursable > 0 && (
                      <MDBCardText className='text-success'>
                        <strong>Remboursement:</strong> {reservation.montantRemboursable.toFixed(2)}€
                      </MDBCardText>
                    )}
                  </MDBCol>
                  <MDBCol md={6}>
                    <MDBCardText className='fw-bold'>
                      <strong>Total final:</strong> {reservation.montantTotal.toFixed(2)}€
                    </MDBCardText>
                  </MDBCol>
                </MDBRow>
              </div>

              <MDBAccordion initialActive='panelsStayOpen-collapse1' className='mb-4'>
                <MDBAccordionItem collapseId='panelsStayOpen-collapse1' headerTitle='Historique des modifications'>
                  {reservation.modifications.length > 0 ? (
                    <MDBListGroup style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {reservation.modifications.map((modif, index) => (
                        <MDBListGroupItem key={index}>
                          <div className='d-flex justify-content-between'>
                            <strong>{formatDateTime(modif.date)}</strong>
                            <span className={`badge ${modif.type === 'update' ? 'bg-primary' : 'bg-warning'}`}>
                              {modif.type === 'update' ? 'Modification' : 'Annulation partielle'}
                            </span>
                          </div>
                          <div className='mt-2'>
                            <small className='text-muted'>
                              De {formatDuree(modif.ancienneDuree)} à {formatDuree(modif.nouvelleDuree)}
                            </small>
                          </div>
                          {modif.montantAjoute > 0 && (
                            <div className='text-warning'>
                              <small>+{modif.montantAjoute.toFixed(2)}€</small>
                            </div>
                          )}
                          {modif.montantRembourse > 0 && (
                            <div className='text-success'>
                              <small>-{modif.montantRembourse.toFixed(2)}€</small>
                            </div>
                          )}
                        </MDBListGroupItem>
                      ))}
                    </MDBListGroup>
                  ) : (
                    <p className='text-muted'>Aucune modification enregistrée</p>
                  )}
                </MDBAccordionItem>
              </MDBAccordion>

              <div className='mb-4'>
                <h6>Ajouter un rappel</h6>
                <div className='d-flex align-items-center'>
                  <MDBInput
                    value={nouveauRappel}
                    onChange={e => setNouveauRappel(e.target.value)}
                    placeholder='Date et heure du rappel'
                    type='datetime-local'
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
                      {formatDateTime(rappel)}
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
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer modifications'
                )}
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

      {/* Modal de remboursement */}
      {showRefundModal && (
        <RefundModal
          show={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          amount={reservation.montantRemboursable}
          onSuccess={handleRefundSuccess}
        />
      )}
    </>
  );
}

export default UpdateReservation;
