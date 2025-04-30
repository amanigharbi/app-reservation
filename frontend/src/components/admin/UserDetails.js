import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProfileUser } from "../../services/profile.api";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBBtn,
  MDBIcon,
  MDBRow,
  MDBCol,
} from "mdb-react-ui-kit";

const defaultImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        const res = await fetchProfileUser(token, userId);
        setUserDetails(res.data);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des détails de l'utilisateur:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) loadUserDetails();
  }, [userId, token]);

  if (loading) return <div className="text-center py-5">Chargement...</div>;

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
              Retour à la liste des utilisateurs
            </MDBBtn>
          </div>

          {/* Titre */}
          <MDBCardTitle className="text-primary fs-3 mb-4">
            <MDBIcon icon="user-circle" className="me-2" />
            Profil de {userDetails.username || "Utilisateur inconnu"}
          </MDBCardTitle>

          {/* Profil utilisateur */}
          <div className="d-flex flex-column flex-md-row align-items-start gap-4">
            {/* Image avec fallback */}
            <img
              src={userDetails.photoURL || defaultImage}
              alt="Photo de profil"
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

            {/* Infos utilisateur */}
            <div className="w-100">
              <MDBRow>
                <MDBCol md="6" className="mb-3">
                  <strong>Nom complet :</strong>{" "}
                  {userDetails.firstName || "Non renseigné"}{" "}
                  {userDetails.lastName || ""}
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <strong>Email :</strong>{" "}
                  {userDetails.email || "Non renseigné"}
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <strong>Poste :</strong>{" "}
                  {userDetails.position || "Non renseigné"}
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <strong>Rôle :</strong> {userDetails.role || "Non renseigné"}
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <strong>Localisation :</strong>{" "}
                  {userDetails.location || "Non renseigné"}
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <strong>Inscription :</strong>{" "}
                  {userDetails.createdAt && userDetails.createdAt._seconds
                    ? new Date(
                        userDetails.createdAt._seconds * 1000
                      ).toLocaleDateString()
                    : "Non renseigné"}
                </MDBCol>
              </MDBRow>

              {/* Réseaux sociaux */}
              <div className="mt-4">
                <strong>Réseaux sociaux :</strong>
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
                    <div className="text-muted ms-2">Aucun lien fourni</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 d-flex gap-3">
            <MDBBtn color="danger" style={{ textTransform: "none" }}>
              Supprimer l'utilisateur
            </MDBBtn>
            <MDBBtn color="warning" style={{ textTransform: "none" }}>
              Modifier le rôle
            </MDBBtn>
          </div>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
}

export default UserDetails;
