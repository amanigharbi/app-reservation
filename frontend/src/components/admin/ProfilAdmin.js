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
  import { useTranslation } from "react-i18next";

  function ProfilAdmin() {
      const { t } = useTranslation();
    
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
    }, [token,setUser,setAdminData]);

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
          message: t("success_profile"),
        });
        setTimeout(
          () => setShowToast({ type: "", visible: false, message: "" }),
          3000
        );
      } catch (error) {
        console.error(t("error_profile"), error);
        setShowToast({
          type: "error",
          visible: true,
          message: t("error_profile"),
        });
      }
    };

    const handlePasswordChange = async () => {
      if (newPassword !== confirmPassword) {
        setShowToast({
          type: "error",
          visible: true,
          message: t("validation_confirm_mismatch"),
        });
        return;
      }

      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) throw new Error(t("no_user"));

        // Prompt for current password (you need to add an input field in your modal)
        const currentPassword = prompt(t("actual_pass"));

        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );

        await reauthenticateWithCredential(currentUser, credential);

        await updatePassword(currentUser, newPassword);

        setShowToast({
          type: "success",
          visible: true,
          message: t("success_update_pass"),
        });

        setShowPasswordModal(false);
        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        console.error(t("error_update_pass"), error);
        setShowToast({
          type: "error",
          visible: true,
          message:
            error.message || t("error_update_pass"),
        });
      }
    };

    if (loading) return <div className="text-center py-5">{t("loading")}</div>;
    if (!adminData)
      return (
        <div className="text-danger text-center py-5">{t("error_loading")}</div>
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

        <h3 className="text-primary fw-bold mb-4">{t("title_prof_admin")}</h3>
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
                  {user?.location || t("unknown")}
                </p>
                <MDBBtn
                  color="danger"
                  size="sm"
                  style={{ textTransform: "none" }}
                  onClick={() => setShowPasswordModal(true)}
                >
                  {t("update_pass")}
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          <MDBCol md="8">
            <MDBCard className="shadow border-0 bg-light">
              <MDBCardBody>
                <MDBCardTitle className="text-primary mb-4">
                  {t("update_info")}
                </MDBCardTitle>
                {[
                  { name: "username", label: t("username") },
                  { name: "firstName", label: t("first_name") },
                  { name: "lastName", label: t("last_name") },
                  { name: "position", label: t("position") },
                  { name: "location", label: t("location") },
                  { name: "website", label: t("website") },
                  { name: "email", label: t("email"), type: "email" },
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
                  <label className="form-label">{t("profile_img")}</label>
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
                  {t("save")}
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
            <Modal.Title>{t("update_pass")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>{t("input_actual")}</Form.Label>
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
                <Form.Label>{t("new_pass")}</Form.Label>
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
                <Form.Label>{t("confirm_password")}</Form.Label>
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
              {t("cancel")}
            </Button>
            <Button variant="primary" onClick={handlePasswordChange}>
              {t("save")}
            </Button>
          </Modal.Footer>
        </Modal>
      </MDBContainer>
    );
  }

  export default ProfilAdmin;
