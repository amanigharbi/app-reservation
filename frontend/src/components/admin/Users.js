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
import { fetchProfileUsers, deleteUser } from "../../services/profile.api";
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
  const [showModal, setShowModal] = useState(false); // Gérer la visibilité de la modale
  const [userToDelete, setUserToDelete] = useState(null); // Utilisateur à supprimer
  const [loadingDelete, setLoadingDelete] = useState(false);

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
      await deleteUser(token, userId); // Appel API pour supprimer l'utilisateur
      setLoadingDelete(true);

      setShowToast({
        type: "success",
        visible: true,
        message: "Utilisateur supprimé avec succès.",
      });
      setUserData(userData.filter((user) => user.id !== userId)); // Mise à jour de la liste des utilisateurs
      setShowModal(false); // Fermer la modale
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      setShowToast({
        type: "error",
        visible: true,
        message: "Erreur lors de la suppression de l'utilisateur.",
      });
    }
  };

  const toggleModal = (user) => {
    setUserToDelete(user); // Affecte l'utilisateur sélectionné pour suppression
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

      <MDBCard className="shadow border-0 bg-light">
        <MDBCardBody>
          <MDBCardTitle className="text-primary mb-4">
            <MDBIcon icon="users-cog" className="me-2" />
            Gestion des Profils utilisateurs
          </MDBCardTitle>

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
                  {user.role === "admin" ? (
                    <td className="text-danger">Administrateur</td>
                  ) : user.role === "user" ? (
                    <td className="text-success">Utilisateur</td>
                  ) : user.role === "superAdmin" ? (
                    <td className="text-warning">Super Administrateur</td>
                  ) : (
                    <td className="text-secondary">Invité</td>
                  )}
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
                        onClick={() => toggleModal(user)} // Ouvre la modale pour confirmer la suppression
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

      {/* Modale de confirmation de suppression */}
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
              <MDBBtn
                color="secondary"
                style={{ textTransform: "none" }}
                onClick={() => setShowModal(false)}
              >
                Annuler
              </MDBBtn>
              <MDBBtn
                color="danger"
                onClick={() => handleDeleteUser(userToDelete.id)} // Appel à la suppression de l'utilisateur
                style={{ textTransform: "none" }}
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
    </MDBContainer>
  );
}

export default Users;
