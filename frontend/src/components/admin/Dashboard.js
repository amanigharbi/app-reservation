import { useEffect, useState } from "react";
import { fetchDashboard } from "../../services/dashboard.api";
import KPI from "./charts/KPI";
import RevenueChart from "./charts/RevenueChart";
import TrendChart from "./charts/TrendChart";
import ReservationTable from "./charts/ReservationTable";
import SpaceTable from "./charts/SpaceTable";
import { useTranslation } from "react-i18next";

function Dashboard() {
        const { t } = useTranslation();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchDashboard(token);
        setDashboardData(res);
      } catch (error) {
        console.error(t("error_dash"), error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadDashboard();
    }
  }, [token,t]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
       {t("loading")}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        {t("error_dash")}
      </div>
    );
  }

  return (
    <div className="space-y-10 p-6">
      {/* Section KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPI
          title={t("reservation_count")}
          value={dashboardData.reservationsCount}
          icon="mdi:calendar-check"
          color="bg-sky-500"
        />
        <KPI
          title={t("space_count")}
          value={dashboardData.spacesCount}
          icon="mdi:office-building"
          color="bg-emerald-500"
        />
        <KPI
          title={t("total_amount")}
          value={`${dashboardData.totalAmount.toFixed(2)} €`}
          icon="mdi:cash-multiple"
          color="bg-amber-400"
        />
        <KPI
          title={t("total_users")}
          value={dashboardData.usersCount}
          icon="mdi:account-group"
          color="bg-indigo-500"
        />
      </div>

      {/* Section Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueChart revenueData={dashboardData.revenuePerMonth} />
        <TrendChart reservationsData={dashboardData.reservationsPerMonth} />
      </div>

      {/* Section Dernières réservations */}
      <ReservationTable reservations={dashboardData.recentReservations} />

      <SpaceTable spaces={dashboardData.recentSpace} />
    </div>
  );
}

export default Dashboard;
