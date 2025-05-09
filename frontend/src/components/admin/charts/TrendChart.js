import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { useTranslation } from "react-i18next";

function TrendChart({ reservationsData }) {
  const { t } = useTranslation();

  const months = Object.keys(reservationsData);

  const data = months.map((key) => {
    const [year, month] = key.split("-");
    const label = `${month}/${year.slice(2)}`; 
    return {
      month: label,
      reservations: reservationsData[key] || 0,
    };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">{t("tendance")}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={t("month")} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="reservations" stroke="#10b981" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrendChart;
