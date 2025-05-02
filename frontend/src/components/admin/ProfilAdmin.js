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
  import {
    getAuth,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
  } from "firebase/auth";
  import { Modal, Button, Form } from "react-bootstrap";
  function ProfilAdmin() {
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState({
      type: "",
      visible: false,
      message: "",
    });
    const token = localStorage.getItem("token");
    const { user, setUser } = useContext(UserContext);

    const [currentPassword, setCurrentPassword] = useState("");
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const handlePasswordChange = async () => {
      if (newPassword !== confirmPassword) {
        setShowToast({
          type: "error",
          visible: true,
          message: "Les mots de passe ne correspondent pas.",
        });
        return;
      }

      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) throw new Error("Aucun utilisateur connecté.");

        // Prompt for current password (you need to add an input field in your modal)
        const currentPassword = prompt("Entrez votre mot de passe actuel :");

        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );

        await reauthenticateWithCredential(currentUser, credential);

        await updatePassword(currentUser, newPassword);

        setShowToast({
          type: "success",
          visible: true,
          message: "Mot de passe mis à jour avec succès.",
        });

        setShowPasswordModal(false);
        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        console.error("Erreur de mise à jour du mot de passe:", error);
        setShowToast({
          type: "error",
          visible: true,
          message:
            error.message || "Erreur lors de la mise à jour du mot de passe.",
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
                <MDBBtn
                  color="danger"
                  size="sm"
                  style={{ textTransform: "none" }}
                  onClick={() => setShowPasswordModal(true)}
                >
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
                <MDBBtn
                  color="primary"
                  className="mt-3"
                  onClick={handleUpdate}
                  style={{ textTransform: "none" }}
                >
                  Enregistrer les modifications
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
        <Modal
          show={showPasswordModal}
          onHide={() => {
            setShowPasswordModal(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          }}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Changer le mot de passe</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Mot de passe actuel</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="ms-2"
                  >
                    {showCurrentPassword ? "🙈" : "👁️"}
                  </Button>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nouveau mot de passe</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="ms-2"
                  >
                    {showNewPassword ? "🙈" : "👁️"}
                  </Button>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirmer le mot de passe</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="ms-2"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </Button>
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
            >
              Annuler
            </Button>
            <Button variant="primary" onClick={handlePasswordChange}>
              Valider
            </Button>
          </Modal.Footer>
        </Modal>
      </MDBContainer>
    );
  }

  export default ProfilAdmin;
