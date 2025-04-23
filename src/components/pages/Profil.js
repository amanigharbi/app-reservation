import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db, storage } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
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

function Profil() {
  const [user, setUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
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
          console.error("Erreur lors de la récupération de l'utilisateur:", error);
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
      let photoURL = user?.photoURL;
      if (selectedFile) {
        const storageRef = ref(storage, `avatars/${user?.uid}`);
        await uploadBytes(storageRef, selectedFile);
        photoURL = await getDownloadURL(storageRef);
      }

      const updatedUser = { ...editData, photoURL };
      await updateDoc(doc(db, "users", user?.uid), updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
    }
  };

  if (loading) {
    return (
      <MDBContainer className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </MDBContainer>
    );
  }

  if (!user) return null;

  return (
    <MDBContainer fluid className="dashboard-bg px-0">
      <div className="dashboard-navbar d-flex align-items-center justify-content-between px-4 py-3 shadow bg-primary">
        <div className="d-flex align-items-center gap-4">
          <img src={logo} alt="Logo" style={{ width: "100px" }} />
          <nav className="dashboard-menu d-none d-md-flex gap-4">
            <Link to="/dashboard">
              <MDBIcon icon="tachometer-alt" className="me-2" /> Tableau de bord
            </Link>
            <Link to="/mes-reservations">
              <MDBIcon icon="clipboard-list" className="me-2" /> Mes Réservations
            </Link>
            <Link to="/reserver">
              <MDBIcon icon="calendar-check" className="me-2" /> Réserver
            </Link>
            <Link to="/profil">
              <MDBIcon icon="user-circle" className="me-2" /> Profil
            </Link>
          </nav>
        </div>
        <div className="d-flex align-items-center gap-3">
          <img
            src={
              user?.photoURL ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.username || "Utilisateur"
              )}&background=fff&color=3B71CA&size=40`
            }
            alt="Avatar"
            className="rounded-circle shadow-sm"
            style={{ width: "40px", height: "40px", border: "2px solid white" }}
          />
          <span className="text-white">{user?.username || "Utilisateur"}</span>
          <MDBBtn size="sm" color="white" onClick={handleLogout}>
            <MDBIcon icon="sign-out-alt" />
          </MDBBtn>
        </div>
      </div>

      <MDBContainer className="py-5 px-4">
        <h3 className="text-primary fw-bold mb-4">Mon Profil</h3>
        <MDBRow>
          <MDBCol md="4">
            <MDBCard className="shadow-lg border-0 bg-light">
              <MDBCardBody className="text-center">
                <img
                  src={
                    user?.photoURL ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.username || "Utilisateur"
                    )}&background=3B71CA&color=fff&size=150`
                  }
                  alt="Avatar"
                  className="rounded-circle mb-3 shadow-lg"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                  }}
                />
                <h5>{user?.username}</h5>
                <p className="text-muted">{user?.email}</p>
                <p className="text-muted">{user?.position || "Poste non défini"}</p>
                <p className="text-muted">{user?.location || "Localisation inconnue"}</p>
                {user?.website && <p><MDBIcon fab icon="globe" className="me-2" /> {user.website}</p>}
                {user?.github && <p><MDBIcon fab icon="github" className="me-2" /> {user.github}</p>}
                {user?.twitter && <p><MDBIcon fab icon="twitter" className="me-2" /> {user.twitter}</p>}
                {user?.instagram && <p><MDBIcon fab icon="instagram" className="me-2" /> {user.instagram}</p>}
                {user?.facebook && <p><MDBIcon fab icon="facebook" className="me-2" /> {user.facebook}</p>}
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          <MDBCol md="8">
            <MDBCard className="shadow border-0 bg-light">
              <MDBCardBody>
                <MDBCardTitle className="text-primary">Modifier mes informations</MDBCardTitle>
                <MDBInput label="Username" name="username" value={editData.username || ""} onChange={handleChange} className="mb-3" />

                <MDBInput label="Prénom" name="firstName" value={editData.firstName || ""} onChange={handleChange} className="mb-3" />
                <MDBInput label="Nom" name="lastName" value={editData.lastName || ""} onChange={handleChange} className="mb-3" />
                <MDBInput label="Email" name="email" value={editData.email || ""} onChange={handleChange} className="mb-3" />
                <MDBInput label="Poste" name="position" value={editData.position || ""} onChange={handleChange} className="mb-3" />
                <MDBInput label="Localisation" name="location" value={editData.location || ""} onChange={handleChange} className="mb-3" />
                <MDBInput label="Site Web" name="website" value={editData.website || ""} onChange={handleChange} className="mb-3" />
                <MDBInput label="GitHub" name="github" value={editData.github || ""} onChange={handleChange} className="mb-3" />
                <MDBInput label="Twitter" name="twitter" value={editData.twitter || ""} onChange={handleChange} className="mb-3" />
                <MDBInput label="Instagram" name="instagram" value={editData.instagram || ""} onChange={handleChange} className="mb-3" />
                <MDBInput label="Facebook" name="facebook" value={editData.facebook || ""} onChange={handleChange} className="mb-3" />
                <input type="file" onChange={handleImageUpload} />
                <MDBBtn onClick={handleUpdate} color="primary" className="mt-3">Mettre à jour</MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>

      <footer className="footer text-center p-3 bg-primary text-white">
        © 2025 ReserGo. Tous droits réservés.
      </footer>
    </MDBContainer>
  );
}

export default Profil;
