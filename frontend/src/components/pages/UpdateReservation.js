import React, { useState, useEffect } from "react";
import axios from "axios";
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

import PaymentModal from "./PaymentModal";
import RefundModal from "./RefundModal";

function UpdateReservation({ reservationId, onClose, showModal }) {
  const [reservation, setReservation] = useState(null);
  const [nouveauRappel, setNouveauRappel] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });
  const [error, setError] = useState("");
  const [showModificationHistory, setShowModificationHistory] = useState(false); // Etat pour l'historique
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [setShowModal] = useState(false);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/protected/reservations/${reservationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = res.data;

        setReservation({
          ...data,
          dureeInitiale: data.duree || 0,
          dureeModifiee: data.duree || 0,
          montantDejaPaye: data.montant || 0,
          montantSupplementaire: 0,
          montantRemboursable: 0,
          montantTotal: Number(data.montant) || 0,
        });
      } catch (err) {
        console.error("Erreur chargement réservation:", err);
        setError("Erreur lors du chargement de la réservation");
      }
    };

    if (reservationId) fetchReservation();
  }, [reservationId]);

  useEffect(() => {
    if (reservation && reservation.heure_arrivee && reservation.heure_depart) {
      const [h1, m1] = reservation.heure_arrivee.split(":").map(Number);
      const [h2, m2] = reservation.heure_depart.split(":").map(Number);

      if (h2 * 60 + m2 <= h1 * 60 + m1) {
        setError("L'heure de départ doit être après l'heure d'arrivée");
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
    }
  }, [reservation?.heure_arrivee, reservation?.heure_depart]);

  const formatDuree = (heuresDecimales) => {
    const totalMinutes = Math.round(parseFloat(heuresDecimales) * 60);
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return isNaN(heures)
      ? ""
      : minutes === 0
      ? `${heures}h`
      : `${heures}h ${minutes}min`;
  };

  const saveReservation = async (transaction = null) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const modifications = [...(reservation.modifications || [])];

      if (transaction) {
        modifications.push({
          date: new Date().toISOString(),
          type: transaction.type,
          ancienneDuree: reservation.dureeInitiale,
          nouvelleDuree: reservation.dureeModifiee,
          montantAjoute:
            transaction.type === "paiement"
              ? reservation.montantSupplementaire
              : 0,
          montantRembourse:
            transaction.type === "remboursement"
              ? reservation.montantRemboursable
              : 0,
        });
      }

      await axios.put(
        `http://localhost:5000/api/protected/reservations/${reservationId}`,
        {
          date: reservation.date,
          numGuests: reservation.participants,
          status: reservation.status,
          heure_arrivee: reservation.heure_arrivee,
          heure_depart: reservation.heure_depart,
          duree: reservation.dureeModifiee,
          spaceMontant: reservation.spaceMontant,
          montant: reservation.montantTotal,
          rappels: reservation.rappels || [],
          modifications,
          paiements: reservation.paiements || [],
          remboursements: reservation.remboursements || [],
          annulations: reservation.annulations || [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowToast({
        type: "success",
        visible: true,
        message: "Réservation mise à jour avec succès !",
      });
      setTimeout(() => onClose(true), 2000);
    } catch (error) {
      console.error("Erreur mise à jour réservation:", error);
      setShowToast({
        type: "error",
        visible: true,
        message: "Erreur lors de la mise à jour.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (reservation.montantSupplementaire > 0) {
      setShowPaymentModal(true);
    } else if (reservation.montantRemboursable > 0) {
      setShowRefundModal(true);
    } else {
      saveReservation();
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
  const handleCancelReservation = (reservation) => {
    setReservationToCancel(reservation);
    setShowCancelModal(true);
  };
  const handleConfirmCancel = async () => {
    setShowCancelModal(false);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!reservationId) {
        console.error("Pas d'ID de réservation, impossible d'envoyer le PUT !");
        return;
      }
      console.log("Reservation envoyée au PUT:", reservation);

      await axios.put(
        `http://localhost:5000/api/protected/reservations/${reservationId}`,
        {
          date: reservation.date,
          numGuests: reservation.participants,
          status: "annulation demandée",
          heure_arrivee: reservation.heure_arrivee,
          heure_depart: reservation.heure_depart,
          duree: reservation.dureeModifiee,
          spaceMontant: reservation.spaceMontant,
          montant: reservation.montantTotal,
          rappels: reservation.rappels || [],
          modifications: reservation.modifications || [],
          paiements: reservation.paiements || [],
          remboursements: reservation.remboursements || [],
          annulations: [
            ...(reservation.annulations || []),
            {
              date: new Date().toISOString(),
              motif: "Demande d'annulation par utilisateur",
            },
          ],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowToast({
        type: "success",
        visible: true,
        message: "Demande d'annulation de réservation avec succès.",
      });

      setTimeout(() => onClose(true), 2000);
    } catch (error) {
      console.error("Erreur annulation:", error);
      setShowToast({
        type: "error",
        visible: true,
        message: "Erreur lors de la demande de l'annulation.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!reservation && loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }
  if (!reservation) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <MDBModal open={showModal} onClose={() => onClose(false)} tabIndex="-1">
        <MDBModalDialog size="lg">
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Modifier Réservation</MDBModalTitle>
            </MDBModalHeader>
            <MDBModalBody>
              {error && <div className="alert alert-danger">{error}</div>}
              <MDBRow className="mb-3">
                <MDBCol md="6">
                  <MDBInput
                    label="Date"
                    type="date"
                    value={reservation.date}
                    onChange={(e) =>
                      setReservation({ ...reservation, date: e.target.value })
                    }
                  />
                </MDBCol>
                <MDBCol md="3">
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
                  />
                </MDBCol>
                <MDBCol md="3">
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

              {/* Montant */}
              <MDBCardText>
                <strong>Durée initiale:</strong>{" "}
                {formatDuree(reservation.dureeInitiale)}
              </MDBCardText>
              <MDBCardText>
                <strong>Nouvelle durée:</strong>{" "}
                {formatDuree(reservation.dureeModifiee)}
              </MDBCardText>
              <MDBCardText>
                <strong>Supplément:</strong>{" "}
                {reservation.montantSupplementaire.toFixed(2)} €
              </MDBCardText>
              <MDBCardText>
                <strong>Remboursement:</strong>{" "}
                {reservation.montantRemboursable.toFixed(2)} €
              </MDBCardText>
              <MDBCardText>
                <strong>Total final:</strong>{" "}
                {Number(reservation.montantTotal).toFixed(2)} €
              </MDBCardText>

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
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn
                color="danger"
                onClick={handleCancelReservation}
                style={{ textTransform: "none" }}
              >
                Annuler la réservation
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
                disabled={loading}
                style={{ textTransform: "none" }}
              >
                {loading ? "Enregistrement..." : "Enregistrer"}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
      {/* Modal */}
      <MDBModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
      >
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Confirmer l'annulation</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowModal(false)}
              />
            </MDBModalHeader>
            <MDBModalBody>
              Êtes-vous sûr de vouloir annuler cette réservation ?
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn
                color="secondary"
                style={{ textTransform: "none" }}
                onClick={() => setShowModal(false)}
              >
                Annuler
              </MDBBtn>
              <MDBBtn
                color="danger"
                onClick={handleConfirmCancel}
                style={{ textTransform: "none" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Annulation...
                  </>
                ) : (
                  "Annuler la réservation"
                )}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Modals */}
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

      {/* Toast */}
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
            style={{ transition: "opacity 0.3s ease-in-out" }}
          >
            <div className="toast-header text-white">
              <strong className="me-auto">
                {showToast.type === "success" ? "Succès" : "Erreur"}
              </strong>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowToast({ visible: false })}
              ></button>
            </div>
            <div className="toast-body">{showToast.message}</div>
          </div>
        </div>
      )}
    </>
  );
}

export default UpdateReservation;
