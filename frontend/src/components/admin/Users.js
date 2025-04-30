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

function Users() {
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
  const [newUser, setNewUser] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    role: "user",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadProfils = async () => {
      try {
        const res = await fetchProfileUsers(token);
        const allUsers = res.data.users || [];
        setUserData(allUsers);
      } catch (error) {
        console.error("Erreur lors du chargement des profils:", error);
        setShowToast({
          type: "error",
          visible: true,
          message: "Impossible de charger les utilisateurs.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) loadProfils();
  }, [token]);

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(token, userId);
      setLoadingDelete(true);
      setTimeout(() => {
        setShowToast({
          type: "success",
          visible: true,
          message: "Utilisateur supprimé avec succès.",
        });
      }, 2000); // Simulate a delay for the loading spinner

      setUserData(userData.filter((user) => user.id !== userId));
      setShowModal(false);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      setShowToast({
        type: "error",
        visible: true,
        message: "Erreur lors de la suppression de l'utilisateur.",
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleAddUser = async () => {
    const { username, firstName, lastName, email, password } = newUser;

    if (!username || !firstName || !lastName || !email || !password) {
      setShowToast({
        type: "error",
        visible: true,
        message: "Veuillez remplir tous les champs obligatoires.",
      });
      return;
    }

    try {
      const res = await createUser(token, newUser);
      setUserData([...userData, res.user]);
      setShowToast({
        type: "success",
        visible: true,
        message: "Utilisateur ajouté avec succès.",
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
      setShowToast({
        type: "error",
        visible: true,
        message: "Erreur lors de l'ajout de l'utilisateur.",
      });
    }
  };

  const toggleModal = (user) => {
    setUserToDelete(user);
    setShowModal(!showModal);
  };

  if (loading) return <div className="text-center py-5">Chargement...</div>;

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

      <MDBCard className="shadow border-0 bg-light">
        <MDBCardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <MDBCardTitle className="text-primary mb-0">
              <MDBIcon icon="users-cog" className="me-2" />
              Gestion des Profils utilisateurs
            </MDBCardTitle>
            <MDBBtn color="success" onClick={() => setShowAddModal(true)}>
              <MDBIcon icon="plus" className="me-2" />
              Ajouter un utilisateur
            </MDBBtn>
          </div>

          <MDBTable hover responsive>
            <MDBTableHead light>
              <tr>
                <th>#</th>
                <th>Nom d'utilisateur</th>
                <th>Nom complet</th>
                <th>Email</th>
                <th>Poste</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {userData.map((user, index) => (
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
                      ? "Administrateur"
                      : user.role === "user"
                      ? "Utilisateur"
                      : user.role === "superAdmin"
                      ? "Super Administrateur"
                      : "Invité"}
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
              <MDBModalTitle>Ajouter un utilisateur</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowAddModal(false)}
              />
            </MDBModalHeader>
            <MDBModalBody>
              <form>
                <div className="mb-3">
                  <label>Nom d'utilisateur</label>
                  <input
                    className="form-control"
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser({ ...newUser, username: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label>Prénom</label>
                  <input
                    className="form-control"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label>Nom</label>
                  <input
                    className="form-control"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label>Email</label>
                  <input
                    className="form-control"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label>Mot de passe</label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      type={showPassword ? "text" : "password"}
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
                  </div>
                </div>
                <div className="mb-3">
                  <label>Poste</label>
                  <input
                    className="form-control"
                    value={newUser.position}
                    onChange={(e) =>
                      setNewUser({ ...newUser, position: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label>Rôle</label>
                  <select
                    className="form-select"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </form>
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={() => setShowAddModal(false)}>
                Annuler
              </MDBBtn>
              <MDBBtn color="success" onClick={handleAddUser}>
                Ajouter
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </MDBContainer>
  );
}

export default Users;
