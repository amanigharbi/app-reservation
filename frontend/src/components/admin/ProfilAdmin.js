import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBBtn,
  MDBInput,
} from "mdb-react-ui-kit";
import { fetchProfile } from "../../services/profile.api";
import React, { useState, useEffect } from "react";
function ProfilAdmin() {
  const [adminData, setAdminData] = useState(null);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });

  useEffect(() => {
    const loadProfilAdmin = async () => {
      try {
        const res = await fetchProfile(token);
        console.log("Profil admin:", res.data);
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
    <MDBContainer className="py-0">
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
      <h3 className="text-primary fw-bold mb-4">Mon Profil Administrateur</h3>
      <MDBRow>
        {/* Affichage profil */}
        <MDBCol md="4">
          <MDBCard className="shadow border-0 bg-light">
            <MDBCardBody className="text-center">
              <div className="d-flex justify-content-center align-items-center mb-3">
                <img
                  src={
                    adminData.photoURL ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      adminData.username || "Utilisateur"
                    )}&background=3B71CA&color=fff&size=150`
                  }
                  alt="Avatar"
                  className="rounded-circle mb-3 shadow-sm"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                  }}
                />
              </div>
              <h4 className="mb-1">
                {adminData.firstName} {adminData.lastName}
              </h4>
              <p className="text-muted">{adminData.email}</p>
              <p className="text-muted">
                {" "}
                {adminData.position || "Super Admin"}
              </p>
              <p className="text-muted">
                {" "}
                {adminData.location || "Localisation inconnue"}
              </p>
              <MDBBtn color="danger" size="sm">
                Modifier le mot de passe
              </MDBBtn>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        {/* Modification infos */}
        <MDBCol md="8">
          <MDBCard className="shadow border-0 bg-light">
            <MDBCardBody>
              <MDBCardTitle className="text-primary mb-4">
                Modifier mes informations
              </MDBCardTitle>

              <MDBInput
                label="Nom d'utilisateur"
                className="mb-3"
                name="username"
                value={adminData.username || ""}
                onChange={(e) =>
                  setAdminData({ ...adminData, username: e.target.value })
                }
              />
              <MDBInput
                label="Nom"
                className="mb-3"
                name="firstName"
                value={adminData.firstName || ""}
                onChange={(e) =>
                  setAdminData({ ...adminData, firstName: e.target.value })
                }
              />
              <MDBInput
                label="Prénom"
                className="mb-3"
                name="lastName"
                value={adminData.lastName || ""}
                onChange={(e) =>
                  setAdminData({ ...adminData, lastName: e.target.value })
                }
              />
              <MDBInput
                label="Poste"
                className="mb-3"
                name="position"
                value={adminData.position || ""}
                onChange={(e) =>
                  setAdminData({ ...adminData, position: e.target.value })
                }
              />
              <MDBInput
                label="Localisation"
                className="mb-3"
                name="location"
                value={adminData.location || ""}
                onChange={(e) =>
                  setAdminData({ ...adminData, location: e.target.value })
                }
              />
              <MDBInput
                label="Site Web"
                className="mb-3"
                name="website"
                value={adminData.website || ""}
                onChange={(e) =>
                  setAdminData({ ...adminData, website: e.target.value })
                }
              />
              <MDBInput
                label="Email"
                className="mb-3"
                type="email"
                name="email"
                value={adminData.email || ""}
                onChange={(e) =>
                  setAdminData({ ...adminData, email: e.target.value })
                }
              />

              <div className="mb-3">
                <label className="form-label">Photo de profil</label>
                <input type="file" className="form-control" accept="image/*" />
              </div>

              <MDBBtn color="primary" className="mt-3">
                Enregistrer les modifications
              </MDBBtn>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default ProfilAdmin;
