import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { MDBIcon } from "mdb-react-ui-kit";

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white flex flex-col">
        {/* Profile Section */}
        <div className="flex flex-col items-center py-6 border-b border-blue-700">
          <img
            src="https://i.pravatar.cc/80"
            alt="User Avatar"
            className="w-20 h-20 rounded-full mb-2 border-4 border-white shadow"
          />
          <h2 className="text-lg font-semibold">John Don</h2>
          <p className="text-sm text-blue-200">johndon@company.com</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 ">
          <NavLink
                      style={{ color: "white" }}
 
            to="/admin"
            end
            className={({ isActive }) =>
              isActive
                ? "block p-2 bg-blue-700 text-white rounded font-semibold"
                : "block p-2 hover:bg-blue-800 rounded"
            }
          >
            🏠 Dashboard
          </NavLink>
          <NavLink
                      style={{ color: "white" }}
 
            to="/admin/reservations"
            className={({ isActive }) =>
              isActive
                ? "block p-2 bg-blue-700 text-white rounded font-semibold"
                : "block p-2 hover:bg-blue-800 rounded"
            }
          >
            📅 Réservations
          </NavLink>
          <NavLink
                      style={{ color: "white" }}
 
            to="/admin/espaces"
            className={({ isActive }) =>
              isActive
                ? "block p-2 bg-blue-700 text-white rounded font-semibold"
                : "block p-2 hover:bg-blue-800 rounded"
            }
          >
            🏢 Espaces
          </NavLink>
          <NavLink
                      style={{ color: "white" }}
 
            to="/admin/users"
            className={({ isActive }) =>
              isActive
                ? "block p-2 bg-blue-700 text-white rounded font-semibold"
                : "block p-2 hover:bg-blue-800 rounded"
            }
          >
            👥 Utilisateurs
          </NavLink>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Dashboard Admin</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">John Don</span>
            <button
              className="text-red-500 hover:text-red-700 transition"
              onClick={handleLogout}
              title="Déconnexion"
            >
              <MDBIcon icon="sign-out-alt" size="lg" />
            </button>
          </div>
        </header>

        {/* Main Outlet */}
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
