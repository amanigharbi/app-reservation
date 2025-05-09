import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getReservationById,
  updateReservation,
  deleteReservation,
} from "../../services/reservations.api";
import { useNavigate } from "react-router-dom";

import moment from "moment";
import "moment/locale/fr";
import {
  BadgeCheck,
  Clock,
  XCircle,
  Trash2,
  CalendarDays,
  MapPin,
  CreditCard,
  Users,
  MessageSquareText,
  StickyNote,
} from "lucide-react";
import {
  MDBBadge,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBBtn,
  MDBModalBody,
  MDBModalFooter,
  MDBIcon,
} from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";

const ReservationDetail = () => {
  const { t } = useTranslation();

  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });
  const [loadingDelete, setLoadingDelete] = useState(false);
  const token = localStorage.getItem("token");

  // Supprimer une réservation
  const handleConfirmDelete = async () => {
    setLoadingDelete(true);
    try {
      const token = localStorage.getItem("token");

      await deleteReservation(token, id);

      setShowModal(false);
      setShowToast({
        type: "success",
        visible: true,
        message: t("reservation_deleted"),
      });

      setTimeout(() => {
        navigate("/admin/reservations");
      }, 2000);
    } catch (error) {
      console.error(t("delete_error"), error);
      setShowToast({
        type: "error",
        visible: true,
        message: t("delete_error"),
      });
    } finally {
      setLoadingDelete(false);
      setTimeout(() => setShowToast({ type: "", visible: false }), 3000);
    }
  };
  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const data = await getReservationById(token, id);
        setReservation(data);
      } catch (err) {
        console.error(err);
        setError(t("no_load_res"));
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id, token,t]);

  if (loading) return <p>{t("loading")}</p>;
  if (error) return <p>{error}</p>;
  if (!reservation) return <p>{t("no_reservation_title")}</p>;

  const isPast = moment(reservation.date).isBefore(moment());
  const status = isPast ? "Archivé" : reservation.status || "Inconnu";

  const formatDuree = (duree) => {
    const heures = Math.floor(duree);
    const minutes = Math.round((duree - heures) * 60);
    return `${heures}h ${minutes}min`;
  };

  const handleAction = async (action) => {
    const token = localStorage.getItem("token");
    try {
      let newStatus = null;
      if (action === "confirmer") {
        newStatus = "confirmée";
      } else if (action === "refuser") {
        newStatus = "refusée";
      } else if (action === "confirmer_annulation") {
        newStatus = "annulée";
      } else if (action === "archiver") {
        newStatus = "Archivé";
      }

      if (!newStatus) {
        console.error("Action inconnue, aucun statut modifié");
        return;
      }
      await updateReservation(token, id, {
        status: newStatus,
      });
      setShowToast({
        type: "success",
        visible: true,
        message: t("success_update_status"),
      });
      setReservation((prev) => ({
        ...prev,
        status: newStatus,
      }));
    } catch (error) {
      console.error(t("error_update_status"), error);
      setError(t("error_update_status"));
    }
  };

  const renderStatusBadge = (status) => {
    const badgeProps = {
      "En attente": { color: "dark", text: t("a_confirmed") },
      acceptée: { color: "success", text: t("confirmed") },
      annulée: { color: "danger", text: t("cancled") },
      Archivé: { color: "secondary", text: t("archived") },
      "annulation demandée": { color: "warning", text: t("to_cancled") },
      refusée: { color: "danger", text: t("refused") },
    };

    const { color, text } = badgeProps[status] || {
      color: "success",
      text: status,
    };

    return (
      <MDBBadge color={color} className="text-sm px-3 py-2 rounded-pill">
        {text}
      </MDBBadge>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="mb-4 text-start">
        <MDBBtn
          color="secondary"
          onClick={() => navigate("/admin/reservations")}
          size="sm"
          style={{ textTransform: "none" }}
        >
          <MDBIcon icon="arrow-left" className="me-2" />
          {t("return_res")}
        </MDBBtn>
      </div>
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
              {showToast.message || t("default_action_message")}
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Réservation {reservation.code_reservation}
        </h2>
        {renderStatusBadge(status)}
      </div>
      {/* Infos principales */}
      <div className="grid md:grid-cols-2 gap-4 bg-white shadow rounded-xl p-4">
        <p>
          <CalendarDays className="inline mr-2" />{" "}
          <strong>{t("date")} :</strong> {moment(reservation.date).format("LL")}
        </p>
        <p>
          <Clock className="inline mr-2" /> <strong>{t("heur")} :</strong>{" "}
          {reservation.heure_arrivee} - {reservation.heure_depart}
        </p>
        <p>
          <strong>
            <Clock className="inline mr-2" />
            {t("duration")} :
          </strong>{" "}
          {formatDuree(reservation.duree)}
        </p>
        <p>
          <MapPin className="inline mr-2" /> <strong>{t("location")} :</strong>{" "}
          {reservation.lieu}
        </p>
        <p>
          <Users className="inline mr-2" />{" "}
          <strong>{t("participants")} :</strong> {reservation.participants}
        </p>
        <p>
          <CreditCard className="inline mr-2" />{" "}
          <strong>{t("payment")} :</strong> {reservation.mode_paiement}
        </p>
        <p>
          <strong>
            <StickyNote className="inline mr-2" /> {t("description")} :
          </strong>{" "}
          {reservation.description || t("auc")}
        </p>
        <p>
          <strong>
            <MessageSquareText className="inline mr-2" /> {t("comments")} :
          </strong>{" "}
          {reservation.commentaires || t("auc")}
        </p>
      </div>
      {/* Actions */}
      <div className="flex gap-3">
        {status === "En attente" && (
          <>
            <button
              onClick={() => {
                console.log("Confirmer Action");
                handleAction("confirmer");
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 flex items-center gap-1"
            >
              <BadgeCheck size={18} /> {t("conf")}
            </button>
            <button
              onClick={() => {
                console.log("refuser Action");
                handleAction("refuser");
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 flex items-center gap-1"
            >
              <XCircle size={18} /> {t("ref")}
            </button>
          </>
        )}
        {status === "annulation demandée" && (
          <button
            onClick={() => {
              console.log("confirmer_annulation Action");
              handleAction("confirmer_annulation");
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600"
          >
            {t("confirm_cancel")}
          </button>
        )}
        <button
          onClick={() => {
            console.log("supprimer Action");
            setShowModal(true);
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 flex items-center gap-1"
        >
          <Trash2 size={18} /> {t("delete")}
        </button>
      </div>
      {/* Modifications */}
      <div>
        <h3 className="text-xl font-semibold mb-2">{t("updating")}</h3>
        {reservation.modifications && reservation.modifications.length > 0 ? (
          reservation.modifications.map((mod, index) => (
            <div
              key={index}
              className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded mb-3"
            >
              <p>
                <strong>{t("date")} :</strong> {moment(mod.date).format("LL")}
              </p>
              <p>
                <strong>{t("old_duration")} :</strong> {mod.ancienneDuree} h
              </p>
              <p>
                <strong>{t("new_duration")} :</strong> {mod.nouvelleDuree} h
              </p>
              <p>
                <strong>{t("add_amount")} :</strong> {mod.montantAjoute} €
              </p>
              <p>
                <strong>{t("amount_rem")} :</strong> {mod.montantRembourse} €
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">{t("no_update_yet")}</p>
        )}
      </div>
      {/* Paiements */}
      <div>
        <h3 className="text-xl font-semibold mb-2">{t("paim")}</h3>
        {reservation.paiements && reservation.paiements.length > 0 ? (
          reservation.paiements.map((pay, index) => (
            <div
              key={index}
              className="p-4 bg-green-50 border-l-4 border-green-400 rounded mb-3"
            >
              <p>
                <strong>{t("date")} :</strong> {moment(pay.date).format("LLL")}
              </p>
              <p>
                <strong>{t("amount")} :</strong> {pay.montant} €
              </p>
              <p>
                <strong>{t("method")} :</strong> {pay.methode}
              </p>
              <p>
                <strong>{t("id_trans")} :</strong> {pay.transactionId}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">{t("no_paim")}</p>
        )}
      </div>
      {/* Modal */}
      <MDBModal open={showModal} onClose={setShowModal}>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{t("confirm_delete")}</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowModal(false)}
              />
            </MDBModalHeader>
            <MDBModalBody>{t("confirm_delete_supp")} </MDBModalBody>
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
                onClick={() => handleConfirmDelete()}
                style={{ textTransform: "none" }}
                disabled={loadingDelete}
              >
                {loadingDelete ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    {t("deleting")}
                  </>
                ) : (
                  t("delete")
                )}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
};

export default ReservationDetail;
