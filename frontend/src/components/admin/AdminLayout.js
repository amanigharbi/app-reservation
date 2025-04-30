import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { MDBIcon } from "mdb-react-ui-kit";
import React, { useState, useEffect, useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { fetchProfile } from "../../services/profile.api";
import { UserContext } from "../../contexts/UserContext";

function AdminLayout() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });

  const [adminData, setAdminData] = useState(null);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfilAdmin = async () => {
      try {
        const res = await fetchProfile(token);
        setUser(res.data.user);
        setAdminData(res.data.user);
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadProfilAdmin();
    }
  }, [token]);

  const handleLogout = async () => {
    try {
      localStorage.clear();
      // Affichage du toast de succès pour la déconnexion
      setShowToast({
        type: "success",
        visible: true,
        message: "Déconnexion réussie !",
      });

      // Attendre 3 secondes avant de rediriger vers la page de login
      setTimeout(() => {
        signOut(auth)
          .then(() => {
            // Après déconnexion, rediriger vers la page de login
            navigate("/");
          })
          .catch((error) => {
            setShowToast({
              type: "error",
              visible: true,
              message: "Erreur de déconnexion. Veuillez réessayer.",
            });
          });
      }, 2000);
    } catch (error) {
      console.error("Erreur de déconnexion : ", error);
      setShowToast({
        type: "error",
        visible: true,
        message: "Erreur lors de la déconnexion.",
      });
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        Chargement...
      </div>
    );
  }
  if (!adminData) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        Impossible de charger les données de l'admin.
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
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

      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white flex flex-col">
        {/* Profile Section */}
        <div className="flex flex-col items-center py-6 border-b border-blue-700">
          <img
            src={
              user?.photoURL ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.username || "Utilisateur"
              )}&background=fff&color=3B71CA&size=150`
            }
            alt="User Avatar"
            className="w-20 h-20 rounded-full mb-2 border-4 border-white shadow"
          />
          <h2 className="text-lg font-semibold">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-sm text-blue-200">{user?.email}</p>
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
            <Link
              to="/admin/profilAdmin"
              className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-1 rounded transition"
              title="Voir le profil"
            >
              <img
                src={
                  user?.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.username || "Utilisateur"
                  )}&background=3B71CA&color=fff&size=150`
                }
                alt="Profil"
                className="w-8 h-8 rounded-full border border-gray-300"
              />
              <span className="text-primary font-semibold">
                {user?.username || "Utilisateur"}
              </span>
            </Link>

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
