import { useEffect, useState } from "react";
import { fetchReservations } from "../../services/reservations.api";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchReservations(token);
        setReservations(data.reservations);
      } catch (err) {
        console.error("Erreur lors du chargement des réservations :", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmée":
        return "bg-green-100 text-green-700";
      case "annulée":
        return "bg-red-100 text-red-700";
      case "en attente":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Chargement des réservations...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Liste des Réservations
      </h1>
      <div className="overflow-auto bg-white shadow-md rounded-lg">
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
            {reservations.length > 0 ? (
              reservations.map((res) => (
                <tr key={res._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {res.utilisateur?.firstName +
                      " " +
                      res.utilisateur?.lastName || "—"}
                  </td>
                  <td className="px-6 py-4">{res.spaceName || "—"}</td>
                  <td className="px-6 py-4">
                    {format(new Date(res.date), "dd/MM/yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    {res.heure_arrivee} - {res.heure_depart}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        res.status
                      )}`}
                    >
                      {res.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => navigate(`/admin/reservation/${res.id}`)}
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                  Aucune réservation trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reservations;
