import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MDBIcon } from "mdb-react-ui-kit";
import { auth } from "../../firebase";
import { UserContext } from "../../contexts/UserContext";
import { onAuthStateChanged, getIdToken, signOut } from "firebase/auth";
import axios from "axios";
import logo from "../../images/logo-3.png";
import LanguageDropdown from "../LanguageDropdown";
import { useTranslation } from "react-i18next";

function Navbar() {
  // eslint-disable-next-line
  const [userEmail, setUserEmail] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState({ type: "", visible: false, message: "" });
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email);
        const token = await getIdToken(currentUser);
        localStorage.setItem("token", token);

        try {
          const response = await axios.get(
            process.env.REACT_APP_API_URL + "/api/protected/navbar",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = response.data;
          setUser(data.user || currentUser);
        } catch (error) {
          console.error("Erreur backend sécurisé:", error);
          setError(t("navbar_data_error"));
        }
      } else {
        setUserEmail(null);
      }
    });

    return () => unsubscribeAuth();
  }, [setUser, t]);

  const handleLogout = async () => {
    try {
      localStorage.clear();
      setShowToast({ type: "success", visible: true, message: t("logout_success") });
      setTimeout(() => {
        signOut(auth)
          .then(() => navigate("/login"))
          .catch(() => {
            setShowToast({ type: "error", visible: true, message: t("logout_error") });
          });
      }, 2000);
    } catch (error) {
      console.error("Erreur de déconnexion : ", error);
      setShowToast({ type: "error", visible: true, message: t("logout_error_generic") });
    }
  };

  useEffect(() => {
    if (showToast.visible) {
      setTimeout(() => setShowToast({ type: "", visible: false }), 3000);
    }
  }, [showToast]);

  if (error) return <div>{error}</div>;

  return (
    <div className="dashboard-navbar d-flex align-items-center justify-content-between px-4 py-3 shadow bg-primary">
      {showToast.visible && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`toast show fade text-white ${showToast.type === "success" ? "bg-success" : "bg-danger"}`} role="alert">
            <div className={`toast-header ${showToast.type === "success" ? "bg-success" : "bg-danger"} text-white`}>
              <i className={`fas ${showToast.type === "success" ? "fa-check" : "fa-times"} fa-lg me-2`}></i>
              <strong className="me-auto">
                {showToast.type === "success" ? t("success") : t("error")}
              </strong>
              <small>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowToast({ type: "", visible: false })}
              ></button>
            </div>
            <div className="toast-body">{showToast.message || t("default_action_message")}</div>
          </div>
        </div>
      )}

      <div className="d-flex align-items-center gap-4">
        <img src={logo} alt="Logo" style={{ width: "100px", backgroundColor: "transparent" }} />
        <nav className="dashboard-menu d-none d-md-flex gap-4">
          <Link to="/dashboard" className="text-white">
            <MDBIcon icon="tachometer-alt" className="me-2" /> {t("dashboard")}
          </Link>
          <Link to="/mes-reservations" className="text-white">
            <MDBIcon icon="clipboard-list" className="me-2" /> {t("my_reservations")}
          </Link>
          <Link to="/reserver" className="text-white">
            <MDBIcon icon="calendar-check" className="me-2" /> {t("book")}
          </Link>
          <Link to="/profil" className="text-white">
            <MDBIcon icon="user-circle" className="me-2" /> {t("profile")}
          </Link>
        </nav>
      </div>

      <div className="d-flex align-items-center gap-3">
      <LanguageDropdown />

        <img
          src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}&background=3B71CA&color=fff&size=150`}
          alt="Avatar"
          className="rounded-circle shadow-sm"
          style={{ width: "40px", height: "40px", border: "2px solid white" }}
        />
        <Link to="/profil" className="text-white text-decoration-none">
          {user?.username || t("user")}
        </Link>

        <button
          className="btn btn-white btn-sm"
          onClick={handleLogout}
          title={t("logout")}
          style={{ padding: "0.25rem 0.5rem" }}
        >
          <MDBIcon icon="sign-out-alt" />
        </button>
      </div>
    </div>
  );
}

export default Navbar;
