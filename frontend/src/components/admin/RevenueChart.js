import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

function RevenueChart({ revenueData }) {
  const months = Object.keys(revenueData);

  const data = months.map((key) => {
    const [year, month] = key.split("-");
    const label = `${month}/${year.slice(2)}`; 
    return {
      month: label,
      revenu: revenueData[key] || 0,
    };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Revenus par Mois (€)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(e) => `${e}€`} />
          <Tooltip formatter={(value) => [`${value}€`, 'Revenu']} />
          <Legend />
          <Bar dataKey="revenu" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueChart;
