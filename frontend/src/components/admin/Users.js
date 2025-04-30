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
} from "mdb-react-ui-kit";
import { fetchProfileUsers } from "../../services/profile.api";
import React, { useState, useEffect } from "react";

function Users() {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const loadProfils = async () => {
      try {
        const res = await fetchProfileUsers(token);
        const allUsers = res.data.users || [];
        setUserData(allUsers);
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
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

  if (loading) return <div className="text-center py-5">Chargement...</div>;
  if (!Array.isArray(userData))
    return (
      <div className="text-danger text-center py-5">
        Erreur de chargement des données utilisateurs.
      </div>
    );

  return (
    <MDBContainer className="py-5">
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
                  <td>{user.role || "Utilisateur"}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <MDBBtn color="primary" size="sm">
                        <MDBIcon icon="eye" />
                      </MDBBtn>
                      {/* <MDBBtn color="warning" size="sm">
                        <MDBIcon icon="edit" />
                      </MDBBtn> */}
                      <MDBBtn color="danger" size="sm">
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
    </MDBContainer>
  );
}

export default Users;
