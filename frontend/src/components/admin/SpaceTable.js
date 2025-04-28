function SpaceTable({ spaces, onDelete }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Gestion des Espaces</h3>
      <table className="min-w-full text-sm text-gray-700">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2">Nom</th>
            <th className="text-left p-2">Location</th>
            <th className="text-left p-2">Capacité</th>
            <th className="text-left p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {spaces.length > 0 ? (
            spaces.map((space, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="p-2">{space.name}</td>
                <td className="p-2">{space.location}</td>
                <td className="p-2">{space.capacity}</td>
                <td className="p-2">
                  <button
                    onClick={() => onDelete(space.id)}
                    className="text-red-500 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-400">
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
