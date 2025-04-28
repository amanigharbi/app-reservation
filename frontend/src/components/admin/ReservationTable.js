import { MDBBadge } from "mdb-react-ui-kit";
function ReservationTable({ reservations }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Dernières Réservations</h3>
      <table className="min-w-full text-sm text-gray-700">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2">Code</th>
            <th className="text-left p-2">Espace</th>
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Montant (€)</th>
            <th className="text-left p-2">Staus</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length > 0 ? (
            reservations.map((res, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="p-2">{res.code_reservation || "Non défini"}</td>
                <td className="p-2">{res.spaceName || "Non défini"}</td>
                <td className="p-2">
                  {new Date(res.date).toLocaleDateString()}
                </td>
                <td className="p-2">{res.montant} €</td>
                <td>
                  {" "}
                  {res.status === "annulation demandée" && (
                    <MDBBadge color="warning" className="ms-2">
                      A annulée{" "}
                    </MDBBadge>
                  )}
                  {res.status === "annulée" && (
                    <MDBBadge color="danger" className="ms-2">
                      Annulée
                    </MDBBadge>
                  )}
                  {res.status === "En attente" && (
                    <MDBBadge color="secondary" className="ms-2">
                      A confirmée
                    </MDBBadge>
                  )}
                  {res.status === "acceptée" && (
                    <MDBBadge color="success" className="ms-2">
                      Confirmée
                    </MDBBadge>
                  )}
                  {res.status === "refusée" && (
                    <MDBBadge color="danger" className="ms-2">
                      Refusée
                    </MDBBadge>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-400">
                Aucune réservation récente
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReservationTable;
