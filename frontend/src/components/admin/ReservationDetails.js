import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getReservationById,
  updateReservation,
} from "../../services/reservations.api";
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

const ReservationDetail = () => {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "En attente":
        return "bg-yellow-200 text-yellow-800";
      case "confirmée":
        return "bg-green-200 text-green-800";
      case "annulée":
        return "bg-red-200 text-red-800";
      case "Archivé":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-blue-200 text-blue-800";
    }
  };
  const formatDuree = (duree) => {
    const heures = Math.floor(duree);
    const minutes = Math.round((duree - heures) * 60);
    return `${heures}h ${minutes}min`;
  };

  const handleAction = async (action) => {
    const token = localStorage.getItem("token");

    // Debug: Afficher la valeur de l'action reçue
    console.log("Action reçue:", action);

    try {
      let newStatus = null;

      // Vérifier que l'action est bien l'une des valeurs attendues
      if (action === "confirmer") {
        newStatus = "confirmée";
      } else if (action === "annuler") {
        newStatus = "annulée";
      } else if (action === "confirmer_annulation") {
        newStatus = "annulée"; // Confirmer l'annulation, même action que "annuler" dans ce cas
      } else if (action === "archiver") {
        newStatus = "Archivé";
      }

      // Affichage de la nouvelle valeur de status
      console.log("Nouveau statut:", newStatus);

      // Si newStatus est null, arrêter la fonction
      if (!newStatus) {
        console.error("Action inconnue, aucun statut modifié");
        return;
      }

      // Mettre à jour la réservation
      await updateReservation(token, id, {
        status: newStatus,
      });

      // Rafraîchir l'UI avec le nouveau statut
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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
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
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
            status
          )}`}
        >
          {status}
        </span>
      </div>

      {/* Infos principales */}
      <div className="grid md:grid-cols-2 gap-4 bg-white shadow rounded-xl p-4">
        <p>
          <CalendarDays className="inline mr-2" /> <strong>Date :</strong>{" "}
          {moment(reservation.date).format("LLL")}
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
          {formatDuree(reservation.duree)} heures
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
              onClick={() => handleAction("confirmer")}
              className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 flex items-center gap-1"
            >
              <BadgeCheck size={18} /> Confirmer
            </button>
            <button
              onClick={() => handleAction("refuser")}
              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 flex items-center gap-1"
            >
              <XCircle size={18} /> Refuser
            </button>
          </>
        )}
        {status === "annulation demandée" && (
          <button
            onClick={() => {
              console.log("confirmer_annulation");
              handleAction("confirmer_annulation");
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600"
          >
            Confirmer l'annulation
          </button>
        )}
        <button
          onClick={() => handleAction("supprimer")}
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
                <strong>Date :</strong> {moment(mod.date).format("LLL")}
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
    </div>
  );
};

export default ReservationDetail;
