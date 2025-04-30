import { useEffect, useState, useMemo } from "react";
import {
  fetchReservations,
  updateReservation,
} from "../../services/reservations.api";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { MDBBadge } from "mdb-react-ui-kit";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse"; // Import papaparse for CSV export

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("futures");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchReservations(token);
        const today = moment().startOf("day");

        for (const reservation of data.reservations) {
          const resDate = moment(reservation.date);
          if (
            resDate.isBefore(today) &&
            reservation.status.toLowerCase() !== "archivé"
          ) {
            await updateReservation(token, reservation.id, {
              status: "archivé",
            });
          }
        }

        const refreshedData = await fetchReservations(token);
        setReservations(refreshedData.reservations);
      } catch (err) {
        console.error("Erreur :", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "annulation_demandée":
        return <MDBBadge color="warning">A annulée</MDBBadge>;
      case "confirmée":
      case "acceptée":
        return <MDBBadge color="success">Confirmée</MDBBadge>;
      case "annulée":
        return <MDBBadge color="danger">Annulée</MDBBadge>;
      case "en attente":
        return <MDBBadge color="dark">En attente</MDBBadge>;
      case "refusée":
        return <MDBBadge color="danger">Refusée</MDBBadge>;
      case "archivé":
        return <MDBBadge color="secondary">Archivé</MDBBadge>;
      default:
        return <MDBBadge color="light">Inconnu</MDBBadge>;
    }
  };

  const today = moment();
  const futureReservations = reservations.filter((res) =>
    moment(res.date).isSameOrAfter(today, "day")
  );
  const archivedReservations = reservations.filter((res) =>
    moment(res.date).isBefore(today, "day")
  );

  const getFilteredSortedList = (list) => {
    let filtered = [...list];
    if (search.trim()) {
      filtered = filtered.filter((res) => {
        const fullName = `${res.utilisateur?.firstName || ""} ${
          res.utilisateur?.lastName || ""
        }`.toLowerCase();
        const space = (res.spaceName || "").toLowerCase();
        return (
          fullName.includes(search.toLowerCase()) ||
          space.includes(search.toLowerCase())
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (res) => res.status?.toLowerCase() === statusFilter
      );
    }

    filtered.sort((a, b) => {
      let fieldA, fieldB;
      if (sortBy === "date") {
        fieldA = new Date(a.date);
        fieldB = new Date(b.date);
      } else if (sortBy === "client") {
        fieldA = `${a.utilisateur?.firstName || ""} ${
          a.utilisateur?.lastName || ""
        }`.toLowerCase();
        fieldB = `${b.utilisateur?.firstName || ""} ${
          b.utilisateur?.lastName || ""
        }`.toLowerCase();
      } else if (sortBy === "space") {
        fieldA = a.spaceName?.toLowerCase() || "";
        fieldB = b.spaceName?.toLowerCase() || "";
      }
      if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const exportPDF = (list) => {
    const doc = new jsPDF();
    const rows = list.map((res) => [
      `${res.utilisateur?.firstName || ""} ${res.utilisateur?.lastName || ""}`,
      res.spaceName,
      format(new Date(res.date), "dd/MM/yyyy"),
      `${res.heure_arrivee} - ${res.heure_depart}`,
      res.status,
    ]);

    autoTable(doc, {
      head: [["Client", "Espace", "Date", "Heure", "Statut"]],
      body: rows,
    });
    doc.save("reservations.pdf");
    setShowToast({
      type: "success",
      visible: true,
      message: "Export PDF effectué !",
    });

    setTimeout(() => setShowToast({ type: "", visible: false }), 3000);
  };

  // Function to export to CSV
  const exportCSV = (list) => {
    const csvData = list.map((res) => ({
      Client: `${res.utilisateur?.firstName || ""} ${
        res.utilisateur?.lastName || ""
      }`,
      Espace: res.spaceName,
      Date: format(new Date(res.date), "dd/MM/yyyy"),
      Heure: `${res.heure_arrivee} - ${res.heure_depart}`,
      Statut: res.status,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reservations.csv";
    link.click();
    // Afficher un message de réussite après l'exportation
    setShowToast({
      type: "success",
      visible: true,
      message: "Export CSV effectué !",
    });
    setTimeout(() => setShowToast({ type: "", visible: false }), 3000);
  };

  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 mb-4 items-center">
      <input
        type="text"
        placeholder="Recherche"
        className="border p-2 rounded shadow-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {activeTab === "futures" && (
        <select
          className="border p-2 rounded shadow-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="acceptée">Confirmée</option>
          <option value="en attente">En attente</option>
          <option value="annulée">Annulée</option>
          <option value="refusée">Refusée</option>
          <option value="annulation_demandée">Annulation demandée</option>
        </select>
      )}

      <select
        className="border p-2 rounded shadow-sm"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="date">Trier par date</option>
        <option value="client">Trier par client</option>
        <option value="space">Trier par espace</option>
      </select>

      <select
        className="border p-2 rounded shadow-sm"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
      >
        <option value="asc">Ascendant</option>
        <option value="desc">Descendant</option>
      </select>

      <button
        onClick={() =>
          exportPDF(
            activeTab === "futures"
              ? getFilteredSortedList(futureReservations)
              : getFilteredSortedList(archivedReservations)
          )
        }
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        Exporter PDF
      </button>

      <button
        onClick={() =>
          exportCSV(
            activeTab === "futures"
              ? getFilteredSortedList(futureReservations)
              : getFilteredSortedList(archivedReservations)
          )
        }
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
      >
        Exporter CSV
      </button>
    </div>
  );

  const renderTable = (list) => (
    <div className="overflow-auto bg-white shadow-md rounded-lg mt-2">
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
          {list.map((res) => (
            <tr key={res._id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-4">
                {res.utilisateur?.firstName} {res.utilisateur?.lastName}
              </td>
              <td className="px-6 py-4">{res.spaceName}</td>
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
  );

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Chargement...</div>;
  }

  const activeList =
    activeTab === "futures" ? futureReservations : archivedReservations;
  const filteredSortedList = getFilteredSortedList(activeList);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
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

      <h1 className="text-2xl font-bold mb-6 text-center text-primary">
        Réservations
      </h1>

      {/* Onglets */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "futures"
              ? "border-b-4 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("futures")}
        >
          Réservations à venir
        </button>
        <button
          className={`ml-4 px-4 py-2 font-medium ${
            activeTab === "archived"
              ? "border-b-4 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("archived")}
        >
          Réservations archivées
        </button>
      </div>

      {renderFilters()}
      {renderTable(filteredSortedList)}
    </div>
  );
}

export default Reservations;
