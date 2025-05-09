import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBIcon,
  MDBBtn,
  MDBModal,
  MDBModalBody,
  MDBModalFooter,
  MDBModalHeader,
  MDBModalDialog,
  MDBModalContent,
  MDBModalTitle,
} from "mdb-react-ui-kit";
import {
  fetchProfileUsers,
  deleteUser,
  createUser,
} from "../../services/profile.api";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Users() {
    const { t } = useTranslation();
  
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputErrors, setInputErrors] = useState({});
  const [newUser, setNewUser] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    role: "user",
    password: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const showToastWithTimeout = ({ type, message }) => {
    setShowToast({ type, visible: true, message });

    setTimeout(() => {
      setShowToast({ type: "", visible: false, message: "" });
    }, 2000);
  };

  useEffect(() => {
    const loadProfils = async () => {
      try {
        const res = await fetchProfileUsers(token);
        const allUsers = res.data.users || [];
        setUserData(allUsers);
      } catch (error) {
        console.error("Erreur lors du chargement des profils:", error);
        showToastWithTimeout({
          type: "error",
          message: t("error_loading_users"),
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) loadProfils();
  }, [token,t]);

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(token, userId);
      setLoadingDelete(true);
      showToastWithTimeout({
        type: "success",
        message: t("success_delete_user"),
      });

      setUserData(userData.filter((user) => user.id !== userId));
      setShowModal(false);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      showToastWithTimeout({
        type: "error",
        message: t("error_delete_user"),
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleAddUser = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let errors = {};

    ["username", "firstName", "lastName", "email", "password"].forEach(
      (field) => {
        if (!newUser[field]) errors[field] = t("champ_req");
      }
    );

    if (newUser.email && !emailRegex.test(newUser.email)) {
      errors.email = t("email_invalid");
    }

    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      showToastWithTimeout({
        type: "error",
        message: t("correct"),
      });

      return;
    }

    setInputErrors({});

    try {
      const res = await createUser(token, newUser);
      setUserData([...userData, res.user]);
      showToastWithTimeout({
        type: "success",
        message: t("success_add_user"),
      });

      setShowAddModal(false);
      setNewUser({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        position: "",
        role: "user",
        password: "",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      showToastWithTimeout({
        type: "error",
        message: t("error_add_user"),
      });
    }
  };

  const toggleModal = (user) => {
    setUserToDelete(user);
    setShowModal(!showModal);
  };
  const filteredUsers = userData.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.position && user.position.toLowerCase().includes(search))
    );
  });

  if (loading) return <div className="text-center py-5">{t("loading")}</div>;

  return (
    <MDBContainer className="py-2">
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

      {/* Table des utilisateurs */}
      <MDBCard className="shadow border-0 bg-light">
        <MDBCardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <MDBCardTitle className="text-primary mb-0">
              <MDBIcon icon="users-cog" className="me-2" />
              {t("gest_users")}
            </MDBCardTitle>

            <MDBBtn
              color="success"
              onClick={() => setShowAddModal(true)}
              style={{ textTransform: "none" }}
            >
              <MDBIcon icon="plus" className="me-2" />
              {t("add_user")}
            </MDBBtn>
          </div>
          {/* Recherche */}

          <div className="d-flex gap-2 mb-4 flex-wrap">
            <input
              type="text"
              className="form-control"
              placeholder={t("search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <MDBTable hover responsive>
            <MDBTableHead light>
              <tr>
                <th>#</th>
                <th>{t("username")}</th>
                <th>{t("full_name")}</th>
                <th>{t("email")}</th>
                <th>{t("position")}</th>
                <th>{t("role")}</th>
                <th>{t("actions")}</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.username}</td>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.position || "—"}</td>
                  <td
                    className={
                      user.role === "admin"
                        ? "text-danger"
                        : user.role === "user"
                        ? "text-success"
                        : user.role === "superAdmin"
                        ? "text-warning"
                        : "text-secondary"
                    }
                  >
                    {user.role === "admin"
                      ? t("admin")
                      : user.role === "user"
                      ? t("user")
                      : user.role === "superAdmin"
                      ? "Super Administrateur"
                      : t("invite")}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link to={`/admin/user-details/${user.id}`}>
                        <MDBBtn color="primary" size="sm">
                          <MDBIcon icon="eye" />
                        </MDBBtn>
                      </Link>
                      <MDBBtn
                        color="danger"
                        size="sm"
                        onClick={() => {
                          setUserToDelete(user);
                          toggleModal(user);
                        }}
                      >
                        <MDBIcon icon="trash" />
                      </MDBBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable>
        </MDBCardBody>
      </MDBCard>

      {/* Modal de suppression */}
      <MDBModal open={showModal} onClose={setShowModal}>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Confirmer la suppression</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowModal(false)}
              />
            </MDBModalHeader>
            <MDBModalBody>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action
              est irréversible.
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </MDBBtn>
              <MDBBtn
                color="danger"
                onClick={() => handleDeleteUser(userToDelete.id)}
                disabled={loadingDelete}
              >
                {loadingDelete ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Modal d'ajout utilisateur */}
      <MDBModal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{t("add_user")}r</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowAddModal(false)}
              />
            </MDBModalHeader>
            <MDBModalBody>
              <form>
                {[
                  { label: t("username"), name: "username" },
                  { label: t("first_name"), name: "firstName" },
                  { label: t("last_name"), name: "lastName" },
                  { label: t("email"), name: "email", type: "email" },
                ].map(({ label, name, type = "text" }) => (
                  <div className="mb-3" key={name}>
                    <label>{label}</label>
                    <input
                      type={type}
                      className={`form-control ${
                        inputErrors[name] ? "is-invalid" : ""
                      }`}
                      value={newUser[name]}
                      onChange={(e) =>
                        setNewUser({ ...newUser, [name]: e.target.value })
                      }
                    />
                    {inputErrors[name] && (
                      <div className="invalid-feedback">
                        {inputErrors[name]}
                      </div>
                    )}
                  </div>
                ))}
                <div className="mb-3">
                  <label>{t("password")}</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${
                        inputErrors.password ? "is-invalid" : ""
                      }`}
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      <MDBIcon icon={showPassword ? "eye-slash" : "eye"} />
                    </button>
                    {inputErrors.password && (
                      <div className="invalid-feedback d-block ms-1">
                        {inputErrors.password}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <label>{t("position")}</label>
                  <input
                    className="form-control"
                    value={newUser.position}
                    onChange={(e) =>
                      setNewUser({ ...newUser, position: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label>{t("role")}</label>
                  <select
                    className="form-select"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    <option value="user">{t("user")}</option>
                    <option value="admin">{t("admin")}</option>
                  </select>
                </div>
              </form>
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn
                color="secondary"
                onClick={() => setShowAddModal(false)}
                style={{ textTransform: "none" }}
              >
                {t("cancel")}
              </MDBBtn>
              <MDBBtn
                color="success"
                onClick={handleAddUser}
                style={{ textTransform: "none" }}
              >
                {t("add_user")}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </MDBContainer>
  );
}

export default Users;
