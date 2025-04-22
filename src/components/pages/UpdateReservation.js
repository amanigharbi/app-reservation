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
  const [toast, setToast] = useState({ visible: false, type: "", message: "" });

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
        setLoading(true);
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
      } finally {
        setLoading(false);
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
      const updateData = {
        date: reservation.date,
        heure_arrivee: reservation.heure_arrivee,
        heure_depart: reservation.heure_depart,
        duree: parseFloat(reservation.dureeModifiee),
        montant: parseFloat(reservation.montantTotal),
        rappels: [...reservation.rappels],
        modifications: arrayUnion({
          date: new Date().toISOString(),
          type: actionType,
          ancienneDuree: reservation.dureeInitiale,
          nouvelleDuree: reservation.dureeModifiee,
          montantAjoute: reservation.montantSupplementaire,
          montantRembourse: reservation.montantRemboursable,
          ...(transaction && { transaction }),
        }),
      };

      if (transaction?.type === "paiement") {
        updateData.paiements = arrayUnion({
          montant: reservation.montantSupplementaire,
          date: new Date().toISOString(),
          methode: transaction.methode,
          transactionId: transaction.transactionId,
        });
      } else if (transaction?.type === "remboursement") {
        updateData.remboursements = arrayUnion({
          montant: reservation.montantRemboursable,
          date: new Date().toISOString(),
          methode: transaction.methode,
          transactionId: transaction.transactionId,
        });
      }

      await updateDoc(doc(db, "reservations", reservationId), updateData);
      setToast({ visible: true, type: "success", message: "Réservation mise à jour avec succès !" });
      onClose(true);
    } catch (error) {
      setError("Erreur lors de la mise à jour");
      setToast({ visible: true, type: "danger", message: "Erreur lors de la mise à jour" });
      console.error(error);
    } finally {
      setLoading(false);
      setTimeout(() => setToast({ visible: false, type: "", message: "" }), 3000);
    }
  };

  const annulerReservation = async () => {
    const confirm = window.confirm("Souhaitez-vous demander l’annulation ?");
    if (!confirm) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, "reservations", reservationId), {
        statut: "annulation demandée",
        annulations: arrayUnion({
          date: new Date().toISOString(),
          initiateur: "utilisateur",
          statut: "en_attente",
          raison: "Demande utilisateur",
        }),
      });
      setToast({ visible: true, type: "success", message: "Demande d'annulation envoyée" });
      onClose(true);
    } catch (err) {
      setToast({ visible: true, type: "danger", message: "Erreur lors de la demande d'annulation" });
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setToast({ visible: false, type: "", message: "" }), 3000);
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
      {toast.visible && (
        <div className={`alert alert-${toast.type} text-center`} role="alert">
          {toast.message}
        </div>
      )}

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      )}

      <MDBModal open={showModal} onClose={() => onClose(false)} tabIndex="-1">
        <MDBModalDialog size="lg">
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Modifier Réservation</MDBModalTitle>
            </MDBModalHeader>

            <MDBModalBody>
              {error && <div className="alert alert-danger">{error}</div>}

              {/* Inputs + Infos calculées */}
              {/* [PAS MODIFIÉ pour clarté, tu peux copier ta version existante ici] */}

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

              {/* ... (reste de tes composants d'affichage) */}
            </MDBModalBody>

            <MDBModalFooter>
              <MDBBtn color="danger" onClick={annulerReservation}>
                Demander une annulation
              </MDBBtn>
              <MDBBtn color="secondary" onClick={() => onClose(false)}>
                Fermer
              </MDBBtn>
              <MDBBtn
                color="primary"
                onClick={handleSubmit}
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
