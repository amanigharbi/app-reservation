import { Outlet, NavLink, useNavigate } from "react-router-dom";

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // ici ajouter logout logique plus tard
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        <div className="text-2xl font-bold p-6 border-b">ReserGo Admin</div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive
                ? "block p-2 bg-blue-100 rounded"
                : "block p-2 hover:bg-gray-200 rounded"
            }
          >
            🏠 Dashboard
          </NavLink>
          <NavLink
            to="/admin/reservations"
            className={({ isActive }) =>
              isActive
                ? "block p-2 bg-blue-100 rounded"
                : "block p-2 hover:bg-gray-200 rounded"
            }
          >
            📅 Réservations
          </NavLink>
          <NavLink
            to="/admin/espaces"
            className={({ isActive }) =>
              isActive
                ? "block p-2 bg-blue-100 rounded"
                : "block p-2 hover:bg-gray-200 rounded"
            }
          >
            🏢 Espaces
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive
                ? "block p-2 bg-blue-100 rounded"
                : "block p-2 hover:bg-gray-200 rounded"
            }
          >
            👥 Utilisateurs
          </NavLink>
          <button
            onClick={handleLogout}
            className="block p-2 hover:bg-red-100 rounded text-red-500 w-full text-left"
          >
            🚪 Déconnexion
          </button>
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-gray-600">Admin</div>
            <img
              src="https://i.pravatar.cc/40"
              alt="avatar"
              className="w-10 h-10 rounded-full"
            />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
