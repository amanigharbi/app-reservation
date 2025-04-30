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
import {
  fetchProfile,
  updateProfile,
  uploadProfileImage,
} from "../../services/profile.api";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";

function ProfilAdmin() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });
  const { user, setUser } = useContext(UserContext);
  const token = localStorage.getItem("token");

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

    if (token) loadProfilAdmin();
  }, [token]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, photoURL: previewUrl }));

    try {
      const response = await uploadProfileImage(token, file);
      const uploadedImageUrl = response.data.imageUrl;

      setAdminData((prev) => ({ ...prev, photoURL: uploadedImageUrl }));

      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await updateProfile(token, adminData);
      setUser(response.data);
      setShowToast({
        type: "success",
        visible: true,
        message: "Profil mis à jour avec succès!",
      });
      window.location.reload();
      setTimeout(
        () => setShowToast({ type: "", visible: false, message: "" }),
        3000
      );
    } catch (error) {
      console.error("Erreur de mise à jour du profil:", error);
      setShowToast({
        type: "error",
        visible: true,
        message: "Erreur lors de la mise à jour du profil.",
      });
    }
  };

  if (loading) return <div className="text-center py-5">Chargement...</div>;
  if (!adminData)
    return (
      <div className="text-danger text-center py-5">Erreur de chargement.</div>
    );

  return (
    <MDBContainer className="py-0">
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
            <div className="toast-header text-white">
              <strong className="me-auto">
                {showToast.type === "success" ? "Succès" : "Erreur"}
              </strong>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() =>
                  setShowToast({ type: "", visible: false, message: "" })
                }
              ></button>
            </div>
            <div className="toast-body">{showToast.message}</div>
          </div>
        </div>
      )}

      <h3 className="text-primary fw-bold mb-4">Mon Profil Administrateur</h3>
      <MDBRow>
        <MDBCol md="4">
          <MDBCard className="shadow border-0 bg-light">
            <MDBCardBody className="text-center">
              <div className="d-flex justify-content-center align-items-center mb-3">
                <img
                  src={
                    user?.photoURL ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      adminData.username || "Admin"
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
              <h4>
                {user?.firstName} {user?.lastName}
              </h4>
              <p className="text-muted">{user?.email}</p>
              <p className="text-muted">{user?.position || "Super Admin"}</p>
              <p className="text-muted">
                {user?.location || "Localisation inconnue"}
              </p>
              <MDBBtn color="danger" size="sm">
                Modifier le mot de passe
              </MDBBtn>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        <MDBCol md="8">
          <MDBCard className="shadow border-0 bg-light">
            <MDBCardBody>
              <MDBCardTitle className="text-primary mb-4">
                Modifier mes informations
              </MDBCardTitle>
              {[
                { name: "username", label: "Nom d'utilisateur" },
                { name: "firstName", label: "Nom" },
                { name: "lastName", label: "Prénom" },
                { name: "position", label: "Poste" },
                { name: "location", label: "Localisation" },
                { name: "website", label: "Site Web" },
                { name: "email", label: "Email", type: "email" },
              ].map(({ name, label, type }) => (
                <MDBInput
                  key={name}
                  label={label}
                  className="mb-3"
                  type={type || "text"}
                  name={name}
                  value={adminData[name] || ""}
                  onChange={(e) =>
                    setAdminData({ ...adminData, [name]: e.target.value })
                  }
                />
              ))}
              <div className="mb-3">
                <label className="form-label">Photo de profil</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <MDBBtn color="primary" className="mt-3" onClick={handleUpdate}>
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
