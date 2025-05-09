import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchProfileUser,
  updateRole,
  deleteUser,
} from "../../services/profile.api";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBBtn,
  MDBIcon,
  MDBRow,
  MDBCol,
  MDBModal,
  MDBModalBody,
  MDBModalFooter,
  MDBModalHeader,
  MDBModalDialog,
  MDBModalContent,
  MDBModalTitle,
} from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";

const defaultImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

function UserDetails() {
  const { t } = useTranslation();

  const { userId } = useParams();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState({
    visible: false,
    message: "",
    type: "",
  });
  const [showModal, setShowModal] = useState(false); // Étape 1 : état pour gérer la modale
  const token = localStorage.getItem("token");
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [editingRole, setEditingRole] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [updating, setUpdating] = useState(false);
  const showToastWithTimeout = ({ type, message }) => {
    setShowToast({ type, visible: true, message });

    setTimeout(() => {
      setShowToast({ type: "", visible: false, message: "" });
    }, 2000);
  };
  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        const res = await fetchProfileUser(token, userId);
        setUserDetails(res.data);
      } catch (error) {
        console.error(
          t("error_loading_users"),
          error
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) loadUserDetails();
  }, [userId, token,t]);

  const handleDelete = async () => {
    try {
      setLoadingDelete(true);

      await deleteUser(token, userId); // Appel de la méthode deleteUser
      showToastWithTimeout({
        type: "success",
        message: t("success_delete_user"),
      });

      setTimeout(() => {
        navigate("/admin/users"); // Rediriger après la suppression
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      showToastWithTimeout({
        type: "error",
        message: t("error_delete_user"),
      });
    }
    setShowModal(false); // Fermer la modale après la suppression
  };
  const handleRoleUpdate = async () => {
    if (!newRole || newRole === userDetails.role) {
      setEditingRole(false);
      return;
    }

    try {
      setUpdating(true);
      await updateRole(token, userId, { role: newRole });
      if (newRole === "user") {
        setUserDetails((prev) => ({ ...prev, role: "Utilisateur" }));
      } else {
        setUserDetails((prev) => ({ ...prev, role: "Administrateur" }));
      }
      setEditingRole(false);
      showToastWithTimeout({
        type: "success",
        message: t("success_update_role"),
      });
    } catch (err) {
      console.error("Erreur lors de la mise à jour du rôle :", err);
      showToastWithTimeout({
        type: "error",
        message: t("error_update_role"),
      });
    } finally {
      setUpdating(false);
    }
  };

  const toggleModal = () => setShowModal(!showModal); // Fonction pour ouvrir/fermer la modale

  if (loading) return <div className="text-center py-5">{t("loading")}</div>;

  return (
    <MDBContainer className="py-0">
      <MDBCard className="shadow border bg-white">
        <MDBCardBody>
          {/* Bouton Retour */}
          <div className="mb-4 text-start">
            <MDBBtn
              color="secondary"
              onClick={() => navigate("/admin/users")}
              size="sm"
              style={{ textTransform: "none" }}
            >
              <MDBIcon icon="arrow-left" className="me-2" />
              {t("return_user")}
            </MDBBtn>
          </div>

          {/* Titre */}
          <MDBCardTitle className="text-primary fs-3 mb-4">
            <MDBIcon icon="user-circle" className="me-2" />
            {t("profil_of")}  {userDetails.username || t("unknown")}
          </MDBCardTitle>

          {/* Profil utilisateur */}
          <div className="d-flex flex-column flex-md-row align-items-start gap-4">
            <img
              src={userDetails.photoURL || defaultImage}
              alt="non dispo"
              className="img-fluid rounded shadow"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
              }}
              style={{
                width: "250px",
                height: "auto",
                border: "2px solid #ddd",
              }}
            />
            <div className="w-100">
              <MDBRow>
                <MDBCol md="6" className="mb-3">
                  <strong>{t("full_name")} :</strong>{" "}
                  {userDetails.firstName || t("not_specified")}{" "}
                  {userDetails.lastName || ""}
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <strong>{t("email")} :</strong>{" "}
                  {userDetails.email || t("not_specified")}
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <strong>{t("position")} :</strong>{" "}
                  {userDetails.position || t("not_specified")}
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <strong>{t("role")} :</strong>{" "}
                  {editingRole ? (
                    <>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="form-select form-select-sm d-inline w-auto mx-2"
                      >
                        <option value="user">{t("user")}</option>
                        <option value="admin">{t("admin")}</option>
                      </select>
                      <MDBBtn
                        color="success"
                        size="sm"
                        onClick={handleRoleUpdate}
                        disabled={updating}
                        style={{ textTransform: "none" }}
                      >
                        {t("valid")}
                      </MDBBtn>
                      <MDBBtn
                        color="light"
                        size="sm"
                        onClick={() => setEditingRole(false)}
                        style={{ textTransform: "none" }}
                      >
                        {t("cancel")}
                      </MDBBtn>
                    </>
                  ) : (
                    <>{userDetails.role || t("not_specified")}</>
                  )}
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <strong>{t("lieu")} :</strong>{" "}
                  {userDetails.location || t("not_specified")}
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <strong>{t("inscription")} :</strong>{" "}
                  {userDetails.createdAt && userDetails.createdAt._seconds
                    ? new Date(
                        userDetails.createdAt._seconds * 1000
                      ).toLocaleDateString()
                    : t("not_specified")}
                </MDBCol>
              </MDBRow>

              {/* Réseaux sociaux */}
              <div className="mt-4">
                <strong>{t("social_media")} :</strong>
                <div className="d-flex gap-3 mt-2 flex-wrap">
                  {userDetails.facebook ||
                  userDetails.twitter ||
                  userDetails.instagram ||
                  userDetails.github ||
                  userDetails.website ? (
                    <>
                      {userDetails.facebook && (
                        <MDBBtn
                          href={userDetails.facebook}
                          target="_blank"
                          color="primary"
                          size="sm"
                        >
                          <MDBIcon fab icon="facebook-f" />
                        </MDBBtn>
                      )}
                      {userDetails.twitter && (
                        <MDBBtn
                          href={userDetails.twitter}
                          target="_blank"
                          color="info"
                          size="sm"
                        >
                          <MDBIcon fab icon="twitter" />
                        </MDBBtn>
                      )}
                      {userDetails.instagram && (
                        <MDBBtn
                          href={userDetails.instagram}
                          target="_blank"
                          color="danger"
                          size="sm"
                        >
                          <MDBIcon fab icon="instagram" />
                        </MDBBtn>
                      )}
                      {userDetails.github && (
                        <MDBBtn
                          href={userDetails.github}
                          target="_blank"
                          color="dark"
                          size="sm"
                        >
                          <MDBIcon fab icon="github" />
                        </MDBBtn>
                      )}
                      {userDetails.website && (
                        <MDBBtn
                          href={userDetails.website}
                          target="_blank"
                          color="secondary"
                          size="sm"
                        >
                          <MDBIcon icon="globe" />
                        </MDBBtn>
                      )}
                    </>
                  ) : (
                    <div className="text-muted ms-2">{t("no_lien")}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 d-flex gap-3">
            <MDBBtn
              color="danger"
              style={{ textTransform: "none" }}
              onClick={toggleModal}
            >
              {t("delete_user")}
            </MDBBtn>
            <MDBBtn
              color="warning"
              style={{ textTransform: "none" }}
              onClick={() => setEditingRole(true)}
            >
              {t("update_role")}
            </MDBBtn>
          </div>
        </MDBCardBody>
      </MDBCard>

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
              {showToast.message || t("default_action_message")}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      <MDBModal open={showModal} onClose={setShowModal}>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{t("confirm_delete")}</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowModal(false)}
              />
            </MDBModalHeader>
            <MDBModalBody>
              {t("confirm_delete_user")}
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn
                color="secondary"
                style={{ textTransform: "none" }}
                onClick={() => setShowModal(false)}
              >
                {t("cancel")}
              </MDBBtn>
              <MDBBtn
                color="danger"
                onClick={() => handleDelete()}
                style={{ textTransform: "none" }}
                disabled={loadingDelete}
              >
                {loadingDelete ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    {t("deleting")}
                  </>
                ) : (
                  t("delete")
                )}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </MDBContainer>
  );
}

export default UserDetails;
