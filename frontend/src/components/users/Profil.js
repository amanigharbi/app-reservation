import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../contexts/UserContext";

import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBBtn,
  MDBIcon,
  MDBInput,
} from "mdb-react-ui-kit";
import "../styles/Pages.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useTranslation } from "react-i18next";

function Profil() {
  const { t } = useTranslation();

  const { user, setUser } = useContext(UserContext);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });
  const navigate = useNavigate();
  const getToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []); // Récupérer les données de l'utilisateur depuis l'API backend

  // Charger les données de l'utilisateur au début
  const fetchUserData = useCallback(async () => {
    const token = getToken();

    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL + "/api/protected/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(response.data.user);
      setEditData(response.data.user);
    } catch (error) {
      console.error(t("error_user"), error);
      setShowToast({
        type: "error",
        visible: true,
        message: t("error_user"),
      });
    } finally {
      setLoading(false);
    }
  }, [setUser, setEditData, setShowToast, setLoading, getToken,t]);
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Preview immédiate juste pour affichage (PAS pour editData)
      const previewUrl = URL.createObjectURL(file);
      setUser((prevUser) => ({ ...prevUser, photoURL: previewUrl }));

      // 2. Upload réel au serveur
      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("token");

      try {
        const response = await axios.post(
          process.env.REACT_APP_API_URL + "/api/protected/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // ✅ ici tu récupères la VRAIE URL du serveur
        const uploadedImageUrl = response.data.imageUrl;

        // ✅ Là tu mets à jour editData AVEC le vrai lien HTTP (PAS le blob)
        setEditData((prevEditData) => ({
          ...prevEditData,
          photoURL: uploadedImageUrl,
        }));
      } catch (error) {
        console.error("Erreur upload image", error);
      }
    }
  };

  // Mettre à jour le profil
  const handleUpdate = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.put(
        process.env.REACT_APP_API_URL + "/api/protected/profile",
        editData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(response.data); // Mettre à jour les informations de l'utilisateur
      setShowToast({
        type: "success",
        visible: true,
        message: t("success_profile"),
      });
      setTimeout(() => {
        setShowToast({ type: "", visible: false, message: "" }); // Cache le toast après quelques secondes
      }, 3000);
    } catch (error) {
      console.error(t("error_profile"), error);
      setShowToast({
        type: "error",
        visible: true,
        message: t("error_profile"),
      });
    }
  };

  if (loading) {
    return (
      <MDBContainer
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t("loading")}</span>
        </div>
      </MDBContainer>
    );
  }

  if (!user) return null;

  return (
    <MDBContainer fluid className="dashboard-bg px-0">
      <Navbar />
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
      <MDBContainer className="py-5 px-4">
        <h3 className="text-primary fw-bold mb-4">{t("title_prof")}</h3>
        <MDBRow>
          <MDBCol md="4">
            <MDBCard className="shadow  bg-light border-0 rounded-3">
              <MDBCardBody className="text-center p-4">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <img
                    src={
                      user?.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.username || t("user")
                      )}&background=3B71CA&color=fff&size=150`
                    }
                    alt="Avatar"
                    className="rounded-circle mb-3 shadow-sm"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      border: "3px solid #f8f9fa",
                    }}
                  />
                </div>
                <h4 className="mb-1">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.username || t("user")}
                </h4>
                <p className="text-muted mb-2">{user?.email || t("email")}</p>

                <p className="text-muted mb-2">
                  {user?.position || t("no_poste")}
                </p>
                <p className="text-muted mb-4">
                  {user?.location || t("no_location")}
                </p>

                <div className="d-flex justify-content-center gap-2 mb-4">
                  <MDBBtn size="sm" color="primary" outline className="px-3">
                    {t("suivi")}
                  </MDBBtn>
                  <MDBBtn size="sm" color="primary" className="px-3">
                  {t("message")}

                  </MDBBtn>
                </div>
              </MDBCardBody>
            </MDBCard>

            <br></br>

            <MDBCard className="shadow  bg-light border-0 rounded-3">
              <MDBCardBody className="text-center p-4">
                <h6 className="text-primary fw-bold mb-4 ">{t("social_media")}
          
                </h6>

                <div className="text-start">
                  <ul className="list-unstyled mb-0">
                    {user?.website && (
                      <li className="mb-2">
                        <MDBIcon icon="globe" className="me-2 text-primary" />
                        <a
                          href={user.website}
                          className="text-decoration-none text-black"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {user.website}
                        </a>
                      </li>
                    )}
                    {user?.github && (
                      <li className="mb-2">
                        <MDBIcon fab icon="github" className="me-2 text-dark" />
                        <a
                          href={`https://github.com/${user.github}`}
                          className="text-decoration-none  text-black"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {user.github}
                        </a>
                      </li>
                    )}
                    {user?.twitter && (
                      <li className="mb-2">
                        <MDBIcon
                          fab
                          icon="twitter"
                          className="me-2 text-info"
                        />
                        <a
                          href={`https://twitter.com/${user.twitter}`}
                          className="text-decoration-none  text-black"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          @{user.twitter}
                        </a>
                      </li>
                    )}
                    {user?.instagram && (
                      <li className="mb-2">
                        <MDBIcon
                          fab
                          icon="instagram"
                          className="me-2 text-danger"
                        />
                        <a
                          href={`https://instagram.com/${user.instagram}`}
                          className="text-decoration-none  text-black"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {user.instagram}
                        </a>
                      </li>
                    )}
                    {user?.facebook && (
                      <li className="mb-2">
                        <MDBIcon
                          fab
                          icon="facebook"
                          className="me-2 text-primary"
                        />
                        <a
                          href={`https://facebook.com/${user.facebook}`}
                          className="text-decoration-none  text-black"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {user.facebook}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          <MDBCol md="8">
            <MDBCard className="shadow border-0 bg-light">
              <MDBCardBody>
                <MDBCardTitle className="text-primary">
                  {t("update_info")}
                </MDBCardTitle>
                <MDBInput
                  label={t("username")}
                  name="username"
                  value={editData.username || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, username: e.target.value })
                  }
                  className="mb-3"
                />
                <MDBInput
                  label={t("first_name")}
                  name="firstName"
                  value={editData.firstName || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, firstName: e.target.value })
                  }
                  className="mb-3"
                />
                <MDBInput
                  label={t("last_namem")}
                  name="lastName"
                  value={editData.lastName || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, lastName: e.target.value })
                  }
                  className="mb-3"
                />
                <MDBInput
                  label={t("position")}
                  name="position"
                  value={editData.position || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, position: e.target.value })
                  }
                  className="mb-3"
                />
                <MDBInput
                  label={t("location")}
                  name="location"
                  value={editData.location || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, location: e.target.value })
                  }
                  className="mb-3"
                />
                <MDBInput
                  label={t("website")}
                  name="website"
                  value={editData.website || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, website: e.target.value })
                  }
                  className="mb-3"
                />
                <MDBInput
                  label="GitHub"
                  name="github"
                  value={editData.github || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, github: e.target.value })
                  }
                  className="mb-3"
                />
                <MDBInput
                  label="Twitter"
                  name="twitter"
                  value={editData.twitter || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, twitter: e.target.value })
                  }
                  className="mb-3"
                />
                <MDBInput
                  label="Instagram"
                  name="instagram"
                  value={editData.instagram || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, instagram: e.target.value })
                  }
                  className="mb-3"
                />
                <MDBInput
                  label="Facebook"
                  name="facebook"
                  value={editData.facebook || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, facebook: e.target.value })
                  }
                  className="mb-3"
                />

                <div className="mb-3">
                  <label className="form-label">{t("choose")}</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleFileChange}
                  />
                </div>

                <MDBBtn onClick={handleUpdate} color="primary" className="mt-3">
                  {t("update")}
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>

      <Footer />
    </MDBContainer>
  );
}

export default Profil;
