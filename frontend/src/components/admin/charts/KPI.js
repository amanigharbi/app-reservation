import { Icon } from "@iconify/react";

function KPI({ title, value, icon, color }) {
  return (
    <div
      className={`rounded-xl shadow-md p-6 flex flex-col items-center justify-center transition-transform transform hover:scale-105 ${color} text-white`}
    >
      <div className="mb-2">
        <Icon icon={icon} width="40" height="40" />
      </div>
      <h3 className="text-sm opacity-80">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

export default KPI;
