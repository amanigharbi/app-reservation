import { MDBBadge } from "mdb-react-ui-kit";

function SpaceTable({ spaces, onDelete }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Espaces</h3>
      <table className="min-w-full text-sm text-gray-700">
        <thead className="text-center">
          <tr className="bg-gray-100">
            <th className="text-left p-2">Nom</th>
            <th className="text-left p-2">Location</th>
            <th className="text-left p-2">Capacité</th>
            <th className="text-left p-2">Montant (€)</th>
            <th className="text-left p-2">Disponibilité</th>
            <th className="text-left p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {spaces ? (
            spaces.map((space, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="p-2">{space.name}</td>
                <td className="p-2">{space.location}</td>
                <td className="p-2">{space.capacity}</td>
                <td className="p-2">{space.montant} €</td>
                <td className="p-2">
                  {space.availableFrom} - {space.availableTo}
                </td>
                <td className="p-2">
                  {space.available  === "true" ? (
                    <MDBBadge color="success" className="ms-2">
                      Disponible
                    </MDBBadge>
                  ) : (
                    <MDBBadge color="danger" className="ms-2">
                      Non disponible
                    </MDBBadge>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-400">
                Aucun espace disponible
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SpaceTable;
