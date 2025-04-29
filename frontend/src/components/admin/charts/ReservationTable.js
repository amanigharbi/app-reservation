import { MDBBadge } from "mdb-react-ui-kit";
import moment from "moment";

function ReservationTable({ reservations }) {
  // Séparer les réservations passées et futures
  const today = moment();
  const futureReservations = reservations.filter((res) =>
    moment(res.date).isAfter(today)
  );
  const archivedReservations = reservations.filter((res) =>
    
    moment(res.date).isBefore(today)
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "annulation demandée":
        return (
          <MDBBadge color="warning" className="ms-2">
            A annulée
          </MDBBadge>
        );
      case "annulée":
        return (
          <MDBBadge color="danger" className="ms-2">
            Annulée
          </MDBBadge>
        );
      case "En attente":
        return (
          <MDBBadge color="dark" className="ms-2">
            En attente
          </MDBBadge>
        );
      case "acceptée":
        return (
          <MDBBadge color="success" className="ms-2">
            Confirmée
          </MDBBadge>
        );
      case "refusée":
        return (
          <MDBBadge color="danger" className="ms-2">
            Refusée
          </MDBBadge>
        );
      case "archivé":
        return (
          <MDBBadge color="secondary" className="ms-2">
            Archivé
          </MDBBadge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Réservations à venir</h3>
      {/* Tableau des réservations à venir */}
      <table className="min-w-full text-sm text-gray-700">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2">Code</th>
            <th className="text-left p-2">Espace</th>
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Montant (€)</th>
            <th className="text-left p-2">Statut</th>
          </tr>
        </thead>
        <tbody>
          {futureReservations.length > 0 ? (
            futureReservations.map((res, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="p-2">{res.code_reservation || "Non défini"}</td>
                <td className="p-2">{res.spaceName || "Non défini"}</td>
                <td className="p-2">
                  {new Date(res.date).toLocaleDateString()}
                </td>
                <td className="p-2">{res.montant} €</td>
                <td>{getStatusBadge(res.status)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-400">
                Aucune réservation à venir
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Réservations archivées */}
      {archivedReservations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Réservations Archivées</h3>
          <table className="min-w-full text-sm text-gray-700">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Code</th>
                <th className="text-left p-2">Espace</th>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Montant (€)</th>
                <th className="text-left p-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {archivedReservations.map((res, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    {res.code_reservation || "Non défini"}
                  </td>
                  <td className="p-2">{res.spaceName || "Non défini"}</td>
                  <td className="p-2">
                    {new Date(res.date).toLocaleDateString()}
                  </td>
                  <td className="p-2">{res.montant} €</td>
                  <td>{getStatusBadge("archivé")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ReservationTable;
