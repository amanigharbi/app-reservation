import React, { useState, useEffect } from "react";
import {
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBInput,
  MDBBtn,
  MDBIcon,
  MDBBadge,
  MDBCardText,
  MDBRow,
  MDBCol,
} from "mdb-react-ui-kit";
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";
import PaymentModal from "./PaymentModal";
import RefundModal from "./RefundModal";

function UpdateReservation({ reservationId, onClose, showModal }) {
  const [reservation, setReservation] = useState({
    date: "",
    heure_arrivee: "",
    heure_depart: "",
    dureeInitiale: 0,
    dureeModifiee: 0,
    rappels: [],
    modifications: [], // Historique des modifications
    paiements: [], // Historique des paiements
    remboursements: [], // Historique des remboursements
    annulations: [], // Historique des annulations
    montantTotal: 0,
    montantDejaPaye: 0,
    montantSupplementaire: 0,
    montantRemboursable: 0,
    spaceMontant: 0,
    statut: "confirmée",
  });

  const [nouveauRappel, setNouveauRappel] = useState("");
  const [disponible, setDisponible] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [actionType, setActionType] = useState("update");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModificationHistory, setShowModificationHistory] = useState(false); // Etat pour l'historique

  const formatDuree = (heuresDecimales) => {
    const totalMinutes = Math.round(parseFloat(heuresDecimales) * 60);
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (isNaN(heures)) return "";
    if (minutes === 0) return `${heures}h`;
    return `${heures}h ${minutes}min`;
  };

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
          });
        }
      } catch (err) {
        setError("Erreur lors du chargement de la réservation");
        console.error(err);
      }
    };

    if (reservationId) loadData();
  }, [reservationId]);

  useEffect(() => {
    if (reservation.heure_arrivee && reservation.heure_depart) {
      const [h1, m1] = reservation.heure_arrivee.split(":").map(Number);
      const [h2, m2] = reservation.heure_depart.split(":").map(Number);

      if (h2 * 60 + m2 <= h1 * 60 + m1) {
        setError("L'heure de départ doit être après l'heure d'arrivée");
        setDisponible(false);
        return;
      }

      const nouvelleDuree = (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
      const differenceDuree = nouvelleDuree - reservation.dureeInitiale;

      let supplement = 0;
      let remboursement = 0;

      if (differenceDuree > 0) {
        supplement = differenceDuree * reservation.spaceMontant;
      } else {
        remboursement = Math.abs(differenceDuree) * reservation.spaceMontant;
      }

      setReservation((prev) => ({
        ...prev,
        dureeModifiee: nouvelleDuree,
        montantSupplementaire: supplement,
        montantRemboursable: remboursement,
        montantTotal: prev.montantDejaPaye + supplement - remboursement,
      }));

      setError("");
      setDisponible(true);
    }
  }, [reservation.heure_arrivee, reservation.heure_depart]);

  const handleSubmit = async () => {
    if (reservation.montantSupplementaire > 0) {
      setActionType("update");
      setShowPaymentModal(true);
    } else if (reservation.montantRemboursable > 0) {
      setActionType("partial_cancel");
      setShowRefundModal(true);
    } else {
      await saveReservation();
    }
  };

  const saveReservation = async (transaction = null) => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      let modificationData = {
        date: now,
        type: actionType,
        ancienneDuree: reservation.dureeInitiale,
        nouvelleDuree: reservation.dureeModifiee,
        montantAjoute: reservation.montantSupplementaire,
        montantRembourse: reservation.montantRemboursable,
      };

      if (transaction) {
        modificationData.transaction = {
          type: transaction.type,
          methode: transaction.methode,
          montant:
            transaction.type === "paiement"
              ? reservation.montantSupplementaire
              : reservation.montantRemboursable,
          transactionId: transaction.transactionId,
        };
      }

      const updateData = {
        date: reservation.date,
        heure_arrivee: reservation.heure_arrivee,
        heure_depart: reservation.heure_depart,
        duree: parseFloat(reservation.dureeModifiee),
        montant: parseFloat(reservation.montantTotal),
        rappels: [...reservation.rappels],
        modifications: arrayUnion(modificationData),
      };

      if (transaction?.type === "paiement") {
        updateData.paiements = arrayUnion({
          montant: reservation.montantSupplementaire,
          date: now,
          methode: transaction.methode,
          transactionId: transaction.transactionId,
        });
      } else if (transaction?.type === "remboursement") {
        updateData.remboursements = arrayUnion({
          montant: reservation.montantRemboursable,
          date: now,
          methode: transaction.methode,
          transactionId: transaction.transactionId,
        });
      }

      await updateDoc(doc(db, "reservations", reservationId), updateData);
      onClose(true);
    } catch (error) {
      setError("Erreur lors de la mise à jour");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const annulerReservation = async () => {
    const confirm = window.confirm("Souhaitez-vous demander l'annulation ?");
    if (!confirm) return;

    setLoading(true);
    try {
      const now = new Date().toISOString();

      const modificationData = {
        date: now,
        type: "annulation",
        ancienneDuree: reservation.dureeInitiale,
        nouvelleDuree: 0,
        montantAjoute: 0,
        montantRembourse: reservation.montantDejaPaye,
      };

      await updateDoc(doc(db, "reservations", reservationId), {
        statut: "annulation demandée",
        modifications: arrayUnion(modificationData),
        duree: 0,
        heure_depart: reservation.heure_arrivee, // Pour annuler la durée
      });

      onClose(true);
    } catch (err) {
      setError("Erreur lors de la demande d'annulation");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentResult) => {
    setShowPaymentModal(false);
    saveReservation({ ...paymentResult, type: "paiement" });
  };

  const handleRefundSuccess = (refundResult) => {
    setShowRefundModal(false);
    saveReservation({ ...refundResult, type: "remboursement" });
  };

  return (
    <>
      <MDBModal open={showModal} onClose={() => onClose(false)} tabIndex="-1">
        <MDBModalDialog size="lg">
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>
                Modifier Réservation
                {reservation.statut === "annulation demandée" && (
                  <MDBBadge color="warning" className="ms-2">
                    Annulation en attente
                  </MDBBadge>
                )}
                {reservation.statut === "annulée" && (
                  <MDBBadge color="danger" className="ms-2">
                    Annulée
                  </MDBBadge>
                )}
                {reservation.statut === "En attente"  && (
                    <MDBBadge color="warning" className="ms-2">
                      En attente de confirmation
                    </MDBBadge>
                  )}
                {reservation.statut === "acceptée" && (
                  <MDBBadge color="success" className="ms-2">
                    Confirmée
                  </MDBBadge>
                )}
              </MDBModalTitle>
            </MDBModalHeader>

            <MDBModalBody>
              {error && <div className="alert alert-danger">{error}</div>}

              {/* Section Formulaire de modification */}
              <MDBRow>
                <MDBCol md={6}>
                  <MDBInput
                    label="Date"
                    type="date"
                    value={reservation.date}
                    onChange={(e) =>
                      setReservation({ ...reservation, date: e.target.value })
                    }
                  />
                </MDBCol>
                <MDBCol md={3}>
                  <MDBInput
                    label="Heure arrivée"
                    type="time"
                    value={reservation.heure_arrivee}
                    onChange={(e) =>
                      setReservation({
                        ...reservation,
                        heure_arrivee: e.target.value,
                      })
                    }
                    disabled={
                      reservation.statut === "annulation demandée" ||
                      reservation.statut === "annulée"
                    }
                  />
                </MDBCol>
                <MDBCol md={3}>
                  <MDBInput
                    label="Heure départ"
                    type="time"
                    value={reservation.heure_depart}
                    onChange={(e) =>
                      setReservation({
                        ...reservation,
                        heure_depart: e.target.value,
                      })
                    }
                  />
                </MDBCol>
              </MDBRow>

              <div className="mt-4 p-3 bg-light rounded">
                <MDBCardText>
                  <strong>Durée initiale:</strong>{" "}
                  {formatDuree(reservation.dureeInitiale)}
                </MDBCardText>
                <MDBCardText>
                  <strong>Nouvelle durée:</strong>{" "}
                  {formatDuree(reservation.dureeModifiee)}
                </MDBCardText>
                <MDBCardText>
                  <strong>Tarif horaire:</strong> {reservation.spaceMontant}€/h
                </MDBCardText>
                <MDBCardText>
                  <strong>Déjà payé:</strong>{" "}
                  {reservation.montantDejaPaye.toFixed(2)}€
                </MDBCardText>
                {reservation.montantSupplementaire > 0 && (
                  <MDBCardText className="text-warning">
                    <strong>Supplément à payer:</strong>{" "}
                    {reservation.montantSupplementaire.toFixed(2)}€
                  </MDBCardText>
                )}
                {reservation.montantRemboursable > 0 && (
                  <MDBCardText className="text-success">
                    <strong>Remboursement:</strong>{" "}
                    {reservation.montantRemboursable.toFixed(2)}€
                  </MDBCardText>
                )}
                <MDBCardText className="fw-bold">
                  <strong>Total final:</strong>{" "}
                  {reservation.montantTotal.toFixed(2)}€
                </MDBCardText>
              </div>

              {/* Section Historique des modifications */}
              <div className="mt-4">
                <MDBBtn
                  color="link"
                  onClick={() =>
                    setShowModificationHistory(!showModificationHistory)
                  }
                >
                  {showModificationHistory ? (
                    <MDBIcon icon="chevron-up" />
                  ) : (
                    <MDBIcon icon="chevron-down" />
                  )}
                  Historique des modifications
                </MDBBtn>

                {showModificationHistory && (
                  <div className="mt-3">
                    {reservation.modifications?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Type</th>
                              <th>Ancienne durée</th>
                              <th>Nouvelle durée</th>
                              <th>Montant</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...reservation.modifications]
                              .sort(
                                (a, b) => new Date(b.date) - new Date(a.date)
                              )
                              .map((modification, index) => {
                                // Trouver l'annulation correspondante si c'est une annulation
                                const annulation =
                                  modification.type === "annulation"
                                    ? reservation.annulations?.find(
                                        (a) => a.date === modification.date
                                      )
                                    : null;

                                return (
                                  <tr key={index}>
                                    <td>
                                      {new Date(
                                        modification.date
                                      ).toLocaleString()}
                                    </td>
                                    <td>
                                      <MDBBadge
                                        color={
                                          modification.type === "update"
                                            ? "primary"
                                            : modification.type ===
                                              "partial_cancel"
                                            ? "warning"
                                            : "danger"
                                        }
                                      >
                                        {modification.type === "update"
                                          ? "Modification"
                                          : modification.type ===
                                            "partial_cancel"
                                          ? "Annulation partielle"
                                          : "Annulation"}
                                      </MDBBadge>
                                    </td>
                                    <td>
                                      {formatDuree(modification.ancienneDuree)}
                                    </td>
                                    <td>
                                      {modification.type === "annulation"
                                        ? "Annulée"
                                        : formatDuree(
                                            modification.nouvelleDuree
                                          )}
                                    </td>
                                    <td>
                                      {modification.montantAjoute > 0 && (
                                        <span className="text-warning">
                                          +
                                          {modification.montantAjoute.toFixed(
                                            2
                                          )}
                                          €
                                        </span>
                                      )}
                                      {modification.montantRembourse > 0 && (
                                        <span className="text-success">
                                          -
                                          {modification.montantRembourse.toFixed(
                                            2
                                          )}
                                          €
                                        </span>
                                      )}
                                      {modification.montantAjoute === 0 &&
                                        modification.montantRembourse === 0 && (
                                          <span>
                                            {reservation.montantTotal.toFixed(
                                              2
                                            )}
                                            €
                                          </span>
                                        )}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <MDBCardText>
                        Aucune modification enregistrée.
                      </MDBCardText>
                    )}
                  </div>
                )}
              </div>

              {/* Section Ajouter un rappel */}
              <div className="mt-4">
                <h6>Ajouter un rappel</h6>
                <div className="d-flex align-items-center">
                  <MDBInput
                    value={nouveauRappel}
                    onChange={(e) => setNouveauRappel(e.target.value)}
                    placeholder="Date et heure du rappel"
                    type="datetime-local"
                  />
                  <MDBBtn
                    color="primary"
                    size="sm"
                    className="ms-2"
                    onClick={() => {
                      if (nouveauRappel) {
                        setReservation({
                          ...reservation,
                          rappels: [...reservation.rappels, nouveauRappel],
                        });
                        setNouveauRappel("");
                      }
                    }}
                  >
                    <MDBIcon icon="plus" />
                  </MDBBtn>
                </div>
                <div className="mt-2">
                  {reservation.rappels.map((rappel, index) => (
                    <MDBBadge key={index} color="info" className="me-2 mb-2">
                      {new Date(rappel).toLocaleString()}
                    </MDBBadge>
                  ))}
                </div>
              </div>
            </MDBModalBody>

            {/* Section Modale Actions */}
            <MDBModalFooter>
              <MDBBtn
                color="danger"
                onClick={annulerReservation}
                style={{ textTransform: "none" }}
              >
                Demander une annulation
              </MDBBtn>
              <MDBBtn
                color="secondary"
                onClick={() => onClose(false)}
                style={{ textTransform: "none" }}
              >
                Fermer
              </MDBBtn>
              <MDBBtn
                color="primary"
                onClick={handleSubmit}
                style={{ textTransform: "none" }}
                disabled={!disponible || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {showPaymentModal && (
        <PaymentModal
          show={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={reservation.montantSupplementaire}
          onSuccess={handlePaymentSuccess}
        />
      )}

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
