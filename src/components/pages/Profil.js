import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db, storage } from "../../firebase";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
import logo from "../../images/logo-3.png";
import "../styles/Pages.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Profil() {
  const [user, setUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });
  const navigate = useNavigate();

  // Récupérer un utilisateur dans Firestore par email
  const fetchUserByEmail = async (email) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { uid: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userFromDB = await fetchUserByEmail(currentUser.email);
          if (userFromDB) {
            setUser(userFromDB);
            setEditData(userFromDB);
          } else {
            console.warn("Utilisateur introuvable dans Firestore");
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              username:
                currentUser.displayName || currentUser.email.split("@")[0],
            });
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération de l'utilisateur:",
            error
          );
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    try {
      const photoURL = editData.photoURL || user?.photoURL;

      const updatedUser = { ...editData, photoURL };

      await updateDoc(doc(db, "users", user?.uid), updatedUser);
      setUser(updatedUser);
      setShowToast({
        type: "success",
        visible: true,
        message: "Profil mis à jour avec succès!",
      });
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      setShowToast({ type: "error", visible: true });
    }
  };

  if (loading) {
    return (
      <MDBContainer
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
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
              {showToast.message || "Une action a été effectuée."}
            </div>
          </div>
        </div>
      )}
      <MDBContainer className="py-5 px-4">
        <h3 className="text-primary fw-bold mb-4">Mon Profil</h3>
        <MDBRow>
          <MDBCol md="4">
            <MDBCard className="shadow  bg-light border-0 rounded-3">
              <MDBCardBody className="text-center p-4">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <img
                    src={
                      user?.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.username || "Utilisateur"
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
                    : user?.username || "Utilisateur"}
                </h4>
                <p className="text-muted mb-2">{user?.email || "Email"}</p>

                <p className="text-muted mb-2">
                  {user?.position || "Poste non défini"}
                </p>
                <p className="text-muted mb-4">
                  {user?.location || "Localisation inconnue"}
                </p>

                <div className="d-flex justify-content-center gap-2 mb-4">
                  <MDBBtn size="sm" color="primary" outline className="px-3">
                    Suivre
                  </MDBBtn>
                  <MDBBtn size="sm" color="primary" className="px-3">
                    Message
                  </MDBBtn>
                </div>
              </MDBCardBody>
            </MDBCard>

            <br></br>

            <MDBCard className="shadow  bg-light border-0 rounded-3">
              <MDBCardBody className="text-center p-4">
                <h6 className="text-primary fw-bold mb-4 ">Réseaux Sociaux</h6>

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
                  Modifier mes informations
                </MDBCardTitle>
                <MDBInput
                  label="Username"
                  name="username"
                  value={editData.username || ""}
                  onChange={handleChange}
                  className="mb-3"
                />
                <MDBInput
                  label="Prénom"
                  name="firstName"
                  value={editData.firstName || ""}
                  onChange={handleChange}
                  className="mb-3"
                />
                <MDBInput
                  label="Nom"
                  name="lastName"
                  value={editData.lastName || ""}
                  onChange={handleChange}
                  className="mb-3"
                />
                <MDBInput
                  label="Poste"
                  name="position"
                  value={editData.position || ""}
                  onChange={handleChange}
                  className="mb-3"
                />
                <MDBInput
                  label="Localisation"
                  name="location"
                  value={editData.location || ""}
                  onChange={handleChange}
                  className="mb-3"
                />
                <MDBInput
                  label="Site Web"
                  name="website"
                  value={editData.website || ""}
                  onChange={handleChange}
                  className="mb-3"
                />
                <MDBInput
                  label="GitHub"
                  name="github"
                  value={editData.github || ""}
                  onChange={handleChange}
                  className="mb-3"
                />
                <MDBInput
                  label="Twitter"
                  name="twitter"
                  value={editData.twitter || ""}
                  onChange={handleChange}
                  className="mb-3"
                />
                <MDBInput
                  label="Instagram"
                  name="instagram"
                  value={editData.instagram || ""}
                  onChange={handleChange}
                  className="mb-3"
                />
                <MDBInput
                  label="Facebook"
                  name="facebook"
                  value={editData.facebook || ""}
                  onChange={handleChange}
                  className="mb-3"
                />
                <MDBInput
                  label="Lien de l'image (CDN)"
                  name="photoURL"
                  value={editData.photoURL || ""}
                  onChange={handleChange}
                  className="mb-3"
                />
                <MDBBtn onClick={handleUpdate} color="primary" className="mt-3">
                  Mettre à jour
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>

    $<Footer />
    </MDBContainer>
  );
}

export default Profil;
