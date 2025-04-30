import React from "react";
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

function Users() {
  return (
    <MDBContainer className="py-5">
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
                <th>Email</th>
                <th>Poste</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {/* Exemple de ligne, à remplacer par un .map plus tard */}
              <tr>
                <td>1</td>
                <td>admin01</td>
                <td>admin@example.com</td>
                <td>Responsable IT</td>
                <td>Super Admin</td>
                <td>
                  <div className="d-flex gap-2">
                    <MDBBtn color="primary" size="sm">
                      <MDBIcon icon="eye" />
                    </MDBBtn>
                    <MDBBtn color="warning" size="sm">
                      <MDBIcon icon="edit" />
                    </MDBBtn>
                    <MDBBtn color="danger" size="sm">
                      <MDBIcon icon="trash" />
                    </MDBBtn>
                  </div>
                </td>
              </tr>
              {/* Fin exemple */}
            </MDBTableBody>
          </MDBTable>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
}

export default Users;
