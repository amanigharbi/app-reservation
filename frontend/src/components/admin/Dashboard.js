import { useEffect, useState } from "react";
import { fetchDashboard } from "../../services/dashboard.api";
import KPI from "./KPI";
import RevenueChart from "./RevenueChart";
import TrendChart from "./TrendChart";
import ReservationTable from "./ReservationTable";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchDashboard(token);
        setDashboardData(res);
      } catch (error) {
        console.error("Erreur lors du chargement du dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadDashboard();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        Chargement...
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        Impossible de charger les données du Dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-10 p-6">
      {/* Section KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPI
          title="Nombre de Réservations"
          value={dashboardData.reservationsCount}
          icon="mdi:calendar-check"
          color="bg-sky-500"
        />
        <KPI
          title="Nombre d'Espaces"
          value={dashboardData.spacesCount}
          icon="mdi:office-building"
          color="bg-emerald-500"
        />
        <KPI
          title="Total Payé"
          value={`${dashboardData.totalAmount.toFixed(2)} €`}
          icon="mdi:cash-multiple"
          color="bg-amber-400"
        />
        <KPI
          title="Nombre d'Utilisateurs"
          value={dashboardData.usersCount}
          icon="mdi:account-group"
          color="bg-indigo-500"
        />
      </div>

      {/* Section Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueChart />
        <TrendChart />
      </div>

      {/* Section Dernières réservations */}
      <ReservationTable reservations={dashboardData.recentReservations} />
    </div>
  );
}

export default Dashboard;
