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
import { useTranslation } from "react-i18next";

function UpdateReservation({ reservationId, onClose, showModal }) {
  const { t } = useTranslation();

  const [reservation, setReservation] = useState(null);
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
  // eslint-disable-next-line
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [setShowModal] = useState(false);
  const checkConflict = async () => {
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

      const reservations = response.data.reservations;

      // Filtrer sur la même date + même espace + exclure cette réservation elle-même
      const conflicts = reservations.filter((res) => {
        if (
          res.date !== reservation.date ||
          res.spaceId !== reservation.spaceId ||
          res.id === reservation.id
        ) {
          return false;
        }

        const [start1, end1] = [
          parseTime(reservation.heure_arrivee),
          parseTime(reservation.heure_depart),
        ];
        const [start2, end2] = [
          parseTime(res.heure_arrivee),
          parseTime(res.heure_depart),
        ];

        // Conflit si chevauchement
        return start1 < end2 && end1 > start2;
      });

      if (conflicts.length > 0) {
        setError(t("time_msg"));
        return true; // conflit détecté
      }

      setError(""); // pas d'erreur
      return false;
    } catch (err) {
      console.error(t("err"), err);
      return false;
    }
  };

  const parseTime = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          process.env.REACT_APP_API_URL +
            `/api/protected/reservations/${reservationId}`,
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
        console.error(t("error_res"), err);
        setError(t("error_res"));
      }
    };

    if (reservationId) fetchReservation();
  }, [reservationId,t]);

  useEffect(() => {
    if (
      reservation &&
      reservation.heure_arrivee &&
      reservation.heure_depart &&
      reservation.dureeInitiale !== undefined &&
      reservation.spaceMontant !== undefined &&
      reservation.montantDejaPaye !== undefined
    ) {
      const [h1, m1] = reservation.heure_arrivee.split(":").map(Number);
      const [h2, m2] = reservation.heure_depart.split(":").map(Number);

      if (h2 * 60 + m2 <= h1 * 60 + m1) {
        setError(t("msg_err"));

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
    // eslint-disable-next-line
  }, [
    reservation?.heure_arrivee,
    // eslint-disable-next-line
    reservation?.heure_depart,
    reservation?.dureeInitiale,
    reservation?.spaceMontant,
    reservation?.montantDejaPaye,
  ]);

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
        process.env.REACT_APP_API_URL +
          `/api/protected/reservations/${reservationId}`,
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
        message: t("success_update"),
      });
      setTimeout(() => onClose(true), 2000);
    } catch (error) {
      console.error(t("error_update"), error);
      setShowToast({
        type: "error",
        visible: true,
        message: t("error_update"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const hasConflict = await checkConflict();
    if (hasConflict) return;

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
        console.error(t("error_put"));
        return;
      }

      await axios.put(
        process.env.REACT_APP_API_URL +
          `/api/protected/reservations/${reservationId}`,
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
        message: t("success_delete_req"),
      });

      setTimeout(() => onClose(true), 2000);
    } catch (error) {
      console.error("Erreur annulation:", error);
      setShowToast({
        type: "error",
        visible: true,
        message: t("error_req_delete"),
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
          <span className="visually-hidden">{t("loading")}</span>
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
          <span className="visually-hidden">{t("loading")}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <MDBModal open={showModal} onClose={() => onClose(false)} tabIndex="-1">
        <MDBModalDialog size="lg">
          <MDBModalContent>
            <MDBModalHeader className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <h5 className="modal-title text-primary fw-bold mb-0 me-3">
                  {t("update_res")}{" "}
                </h5>
                {/* Badge Status */}
                {reservation?.status && (
                  <MDBBadge
                    color={
                      reservation?.status === "acceptée"
                        ? "success"
                        : reservation?.status === "annulée"
                        ? "danger"
                        : reservation?.status === "annulation demandée"
                        ? "warning"
                        : reservation?.status === "En attente"
                        ? "dark"
                        : "secondary"
                    }
                    pill
                    className="px-3 py-2"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {reservation.status}
                  </MDBBadge>
                )}
              </div>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => onClose(false)}
              ></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              {error && <div className="alert alert-danger">{error}</div>}
              <MDBRow className="mb-3">
                <MDBCol md="6">
                  <MDBInput
                    label={t("date")}
                    type="date"
                    value={reservation.date}
                    onChange={(e) =>
                      setReservation({ ...reservation, date: e.target.value })
                    }
                  />
                </MDBCol>
                <MDBCol md="3">
                  <MDBInput
                    label={t("arrival")}
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
                    label={t("departure")}
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
                <strong>{t("initial_dur")}</strong>{" "}
                {formatDuree(reservation.dureeInitiale)}
              </MDBCardText>
              <MDBCardText>
                <strong>{t("new_dur")}</strong>{" "}
                {formatDuree(reservation.dureeModifiee)}
              </MDBCardText>
              <MDBCardText>
                <strong>{t("supp")}</strong>{" "}
                {reservation.montantSupplementaire.toFixed(2)} €
              </MDBCardText>
              <MDBCardText>
                <strong>{t("remb")}</strong>{" "}
                {reservation.montantRemboursable.toFixed(2)} €
              </MDBCardText>
              <MDBCardText>
                <strong>{t("final_total")}</strong>{" "}
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
                  {t("history_update")}
                </MDBBtn>

                {showModificationHistory && (
                  <div className="mt-3">
                    {reservation.modifications?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>{t("date")}</th>
                              <th>{t("type")}</th>
                              <th>{t("old_dur")}</th>
                              <th>{t("new_dur")}</th>
                              <th>{t("amount")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...reservation.modifications]
                              .sort(
                                (a, b) => new Date(b.date) - new Date(a.date)
                              )
                              .map((modification, index) => {
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
                      <MDBCardText>{t("no_update")} </MDBCardText>
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
                {t("cancel_res")}
              </MDBBtn>
              <MDBBtn
                color="secondary"
                onClick={() => onClose(false)}
                style={{ textTransform: "none" }}
              >
                {t("close")}
              </MDBBtn>
              <MDBBtn
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ textTransform: "none" }}
              >
                {loading ? t("saving") : t("save")}
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
              <MDBModalTitle>{t("confirm_cancel")}</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowModal(false)}
              />
            </MDBModalHeader>
            <MDBModalBody>{t("sure_cancel")}</MDBModalBody>
            <MDBModalFooter>
              <MDBBtn
                color="secondary"
                style={{ textTransform: "none" }}
                onClick={() => setShowModal(false)}
              >
                {t("cancel")}
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
                    {t("canceling")}{" "}
                  </>
                ) : (
                  t("cancel_res")
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
