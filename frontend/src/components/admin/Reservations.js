import { useEffect, useState } from "react";
import { fetchReservations, updateReservation } from "../../services/reservations.api";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { MDBBadge } from "mdb-react-ui-kit";

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchReservations(token);

        // Mise à jour des statuts des réservations passées en "archivé"
        const today = moment().startOf("day");
        for (const reservation of data.reservations) {
          const resDate = moment(reservation.date);
          if (resDate.isBefore(today) && reservation.status.toLowerCase() !== "archivé") {
            try {
                await updateReservation(token, reservation.id, {
                      status: "archivé" ,
                    });
            } catch (err) {
              console.error(`Erreur lors de l’archivage de la réservation ${reservation.id} :`, err);
            }
          }
        }

        // Rafraîchissement des données après mise à jour
        const refreshedData = await fetchReservations(token);
        setReservations(refreshedData.reservations);
      } catch (err) {
        console.error("Erreur lors du chargement des réservations :", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "annulation_demandée":
        return <MDBBadge color="warning" className="ms-2">A annulée</MDBBadge>;
      case "confirmée":
      case "acceptée":
        return <MDBBadge color="success" className="ms-1">Confirmée</MDBBadge>;
      case "annulée":
        return <MDBBadge color="danger" className="ms-1">Annulée</MDBBadge>;
      case "en attente":
        return <MDBBadge color="dark" className="ms-1">En attente</MDBBadge>;
      case "refusée":
        return <MDBBadge color="danger" className="ms-1">Refusée</MDBBadge>;
      case "archivé":
        return <MDBBadge color="secondary" className="ms-1">Archivé</MDBBadge>;
      default:
        return <MDBBadge color="light" className="ms-1">Inconnu</MDBBadge>;
    }
  };

  // Séparer les réservations passées et futures
  const today = moment();
  const futureReservations = reservations.filter((res) =>
    moment(res.date).isSameOrAfter(today, "day")
  );
  const archivedReservations = reservations.filter((res) =>
    moment(res.date).isBefore(today, "day")
  );

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Chargement des réservations...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Liste des Réservations</h1>

      {/* Réservations archivées */}
      {archivedReservations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Réservations Archivées</h2>
          <div className="overflow-auto bg-white shadow-md rounded-lg mt-4">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">Client</th>
                  <th className="px-6 py-3 text-left">Espace</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Heure</th>
                  <th className="px-6 py-3 text-left">Statut</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {archivedReservations.map((res) => (
                  <tr key={res._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {res.utilisateur?.firstName + " " + res.utilisateur?.lastName || "—"}
                    </td>
                    <td className="px-6 py-4">{res.spaceName || "—"}</td>
                    <td className="px-6 py-4">
                      {format(new Date(res.date), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      {res.heure_arrivee} - {res.heure_depart}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge("archivé")}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => navigate(`/admin/reservation/${res._id}`)}
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Réservations à venir */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Réservations à venir</h2>
        <div className="overflow-auto bg-white shadow-md rounded-lg mt-4">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left">Client</th>
                <th className="px-6 py-3 text-left">Espace</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Heure</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {futureReservations.map((res) => (
                <tr key={res._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {res.utilisateur?.firstName + " " + res.utilisateur?.lastName || "—"}
                  </td>
                  <td className="px-6 py-4">{res.spaceName || "—"}</td>
                  <td className="px-6 py-4">
                    {format(new Date(res.date), "dd/MM/yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    {res.heure_arrivee} - {res.heure_depart}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(res.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => navigate(`/admin/reservation/${res._id}`)}
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reservations;
