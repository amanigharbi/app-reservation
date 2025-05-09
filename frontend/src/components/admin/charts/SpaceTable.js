import { MDBBadge } from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";


function SpaceTable({ spaces, onDelete }) {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">{t("spaces")}</h3>
      <table className="min-w-full text-sm text-gray-700">
        <thead className="text-center">
          <tr className="bg-gray-100">
            <th className="text-left p-2">{t("name_space")}</th>
            <th className="text-left p-2">{t("location")}</th>
            <th className="text-left p-2">{t("capacity")}</th>
            <th className="text-left p-2">{t("amount")} (€)</th>
            <th className="text-left p-2">{t("disponi")}</th>
            <th className="text-left p-2">{t("status")}</th>
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
                  {space.available ? (
                    <MDBBadge color="success" className="ms-2">
                      {t("dispo")}
                    </MDBBadge>
                  ) : (
                    <MDBBadge color="danger" className="ms-2">
                      {t("no_dispo")}
                    </MDBBadge>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-400">
                {t("no_space")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SpaceTable;
