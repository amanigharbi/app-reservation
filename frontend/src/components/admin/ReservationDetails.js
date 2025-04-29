import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "mdb-react-ui-kit";

const ReservationDetail = () => {
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

  // Supprimer une réservation
  const handleConfirmDelete = async () => {
    console.log("handleConfirmDelete", id);
    setLoadingDelete(true);
    try {
      const token = localStorage.getItem("token");

      await deleteReservation(token, id);

      setShowModal(false);
      setShowToast({
        type: "success",
        visible: true,
        message: "Réservation supprimée !",
      });

      setTimeout(() => {
        navigate("/admin/reservations");
      }, 2000);
    } catch (error) {
      console.error("Erreur suppression:", error);
      setShowToast({
        type: "error",
        visible: true,
        message: "Erreur lors de la suppression.",
      });
    } finally {
      setLoadingDelete(false);
      setTimeout(() => setShowToast({ type: "", visible: false }), 3000);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchReservation = async () => {
      try {
        const data = await getReservationById(token, id);
        setReservation(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de récupérer la réservation.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;
  if (!reservation) return <p>Aucune réservation trouvée.</p>;

  const isPast = moment(reservation.date).isBefore(moment());
  const status = isPast ? "Archivé" : reservation.status || "Inconnu";

  const formatDuree = (duree) => {
    const heures = Math.floor(duree);
    const minutes = Math.round((duree - heures) * 60);
    return `${heures}h ${minutes}min`;
  };

  const handleAction = async (action) => {
    const token = localStorage.getItem("token");
    console.log("handleAction", action);
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

      setReservation((prev) => ({
        ...prev,
        status: newStatus,
      }));
    } catch (error) {
      console.error("Erreur lors de l'action admin:", error);
      setError(
        "Une erreur est survenue lors de la modification de la réservation."
      );
    }
  };

  const renderStatusBadge = (status) => {
    const badgeProps = {
      "En attente": { color: "dark", text: "À confirmer" },
      acceptée: { color: "success", text: "Confirmée" },
      annulée: { color: "danger", text: "Annulée" },
      Archivé: { color: "secondary", text: "Archivé" },
      annulation_demandée: { color: "warning", text: "À annuler" },
      refusée: { color: "danger", text: "Refusée" },
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
              {showToast.message || "Une action a été effectuée."}
            </div>
          </div>
        </div>
      )}

      <div className="mb-3">
        <Link
          to="/admin/reservations"
          className="text-primary"
          style={{ textDecoration: "none", fontWeight: "500" }}
        >
          ← Retour aux réservations
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Réservation {reservation.code_reservation}
        </h2>
        {renderStatusBadge(status)}
      </div>

      {/* Infos principales */}
      <div className="grid md:grid-cols-2 gap-4 bg-white shadow rounded-xl p-4">
        <p>
          <CalendarDays className="inline mr-2" /> <strong>Date :</strong>{" "}
          {moment(reservation.date).format("LL")}
        </p>
        <p>
          <Clock className="inline mr-2" /> <strong>Heures :</strong>{" "}
          {reservation.heure_arrivee} - {reservation.heure_depart}
        </p>
        <p>
          <strong>
            <Clock className="inline mr-2" />
            Durée :
          </strong>{" "}
          {formatDuree(reservation.duree)}
        </p>
        <p>
          <MapPin className="inline mr-2" /> <strong>Lieu :</strong>{" "}
          {reservation.lieu}
        </p>
        <p>
          <Users className="inline mr-2" /> <strong>Participants :</strong>{" "}
          {reservation.participants}
        </p>
        <p>
          <CreditCard className="inline mr-2" />{" "}
          <strong>Mode de paiement :</strong> {reservation.mode_paiement}
        </p>
        <p>
          <strong>
            <StickyNote className="inline mr-2" /> Description :
          </strong>{" "}
          {reservation.description || "Aucune"}
        </p>
        <p>
          <strong>
            <MessageSquareText className="inline mr-2" /> Commentaires :
          </strong>{" "}
          {reservation.commentaires || "Aucun"}
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
              <BadgeCheck size={18} /> Confirmer
            </button>
            <button
              onClick={() => {
                console.log("refuser Action");
                handleAction("refuser");
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 flex items-center gap-1"
            >
              <XCircle size={18} /> Refuser
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
            Confirmer l'annulation
          </button>
        )}
        <button
          onClick={() => {
            console.log("supprimer Action");
            setShowModal(true);
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 flex items-center gap-1"
        >
          <Trash2 size={18} /> Supprimer
        </button>
      </div>

      {/* Modifications */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Modifications</h3>
        {reservation.modifications && reservation.modifications.length > 0 ? (
          reservation.modifications.map((mod, index) => (
            <div
              key={index}
              className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded mb-3"
            >
              <p>
                <strong>Date :</strong> {moment(mod.date).format("LL")}
              </p>
              <p>
                <strong>Ancienne durée :</strong> {mod.ancienneDuree} h
              </p>
              <p>
                <strong>Nouvelle durée :</strong> {mod.nouvelleDuree} h
              </p>
              <p>
                <strong>Montant ajouté :</strong> {mod.montantAjoute} €
              </p>
              <p>
                <strong>Montant remboursé :</strong> {mod.montantRembourse} €
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Aucune modification enregistrée.</p>
        )}
      </div>

      {/* Paiements */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Paiements</h3>
        {reservation.paiements && reservation.paiements.length > 0 ? (
          reservation.paiements.map((pay, index) => (
            <div
              key={index}
              className="p-4 bg-green-50 border-l-4 border-green-400 rounded mb-3"
            >
              <p>
                <strong>Date :</strong> {moment(pay.date).format("LLL")}
              </p>
              <p>
                <strong>Montant :</strong> {pay.montant} €
              </p>
              <p>
                <strong>Méthode :</strong> {pay.methode}
              </p>
              <p>
                <strong>ID transaction :</strong> {pay.transactionId}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Aucun paiement enregistré.</p>
        )}
      </div>
      {/* Modal */}
      <MDBModal open={showModal} onClose={setShowModal}>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Confirmer la suppression</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowModal(false)}
              />
            </MDBModalHeader>
            <MDBModalBody>
              Êtes-vous sûr de vouloir supprimer cette réservation ?
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
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
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
