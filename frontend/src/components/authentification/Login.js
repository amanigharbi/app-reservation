import React, { useState, useEffect, useContext } from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBBtn,
  MDBIcon,
  MDBInput,
  MDBCheckbox,
  MDBSpinner,
} from "mdb-react-ui-kit";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import axios from "axios";
import { UserContext } from "../../contexts/UserContext";

import { auth } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";
import { verifyToken } from "../../api/auth.api";
import logo from "../../images/logo.png";
import "../styles/Pages.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css";

function Login() {
  const getToken = () => localStorage.getItem("token");
  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });
  const { userGet, setUser } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Ajout d'une vérification de token au chargement
  useEffect(() => {
    const verifyStoredToken = async () => {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser?.token) {
        try {
          await verifyToken(savedUser.token);
          navigate("/dashboard");
        } catch {
          localStorage.removeItem("user");
        }
      }
    };
    verifyStoredToken();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      // Vérification côté backend
      await verifyToken(token);

      if (rememberMe) {
        // On peut ajuster la durée de validité du localStorage si nécessaire
        localStorage.setItem(
          "user",
          JSON.stringify({ email: user.email, token })
        );
      }

      // Récupération des données utilisateur
      const response = await axios.get(
        process.env.REACT_APP_API_URL + "/api/protected/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Données utilisateur récupérées:", response.data);
      setUser(response.data.user);

      if (response.data.user?.role === "user") {
        setSuccessMessage("Connexion réussie.");
        navigate("/dashboard");
      } else if (response.data.user?.role === "admin") {
        setSuccessMessage("Connexion réussie.");
        console.log("Admin connecté:", user.email);

        localStorage.setItem("token", token);

        navigate("/admin");
      }
    } catch (err) {
      console.error("Erreur Firebase:", err.code, err.message);
      setError("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      await verifyToken(token);
      localStorage.setItem(
        "user",
        JSON.stringify({ email: result.user.email, token })
      );

      setSuccessMessage("Connexion avec Google réussie.");
      navigate("/dashboard");
    } catch (err) {
      console.error("Erreur Google:", err);
      setError("Erreur lors de la connexion avec Google.");
    }
  };

  return (
    <MDBContainer fluid className="p-12 my-5 h-custom">
      <MDBRow>
        <MDBCol col="10" md="6">
          <img
            src="https://plus.unsplash.com/premium_photo-1663076518116-0f0637626edf?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="img-fluid"
            alt="Illustration de réservation"
          />
        </MDBCol>

        <MDBCol col="4" md="6">
          <div className="d-flex flex-row align-items-center justify-content-center">
            <img
              src={logo}
              alt="ReserGo Logo"
              className="img-fluid"
              style={{
                maxWidth: "200px",
                maxHeight: "150px",
                marginTop: "-10%",
              }}
            />
          </div>

          <div className="d-flex flex-row align-items-center justify-content-center">
            <p className="lead fw-normal mb-0 me-3">Se connecter avec</p>

            <MDBBtn
              floating
              size="md"
              tag="a"
              className="me-2"
              onClick={handleGoogleLogin}
            >
              <MDBIcon fab icon="google" />
            </MDBBtn>
            <MDBBtn floating size="md" tag="a" className="me-2">
              <MDBIcon fab icon="facebook-f" />
            </MDBBtn>
            <MDBBtn floating size="md" tag="a" className="me-2">
              <MDBIcon fab icon="twitter" />
            </MDBBtn>
          </div>

          <div className="divider d-flex align-items-center my-4">
            <p className="text-center fw-bold mx-3 mb-0">Ou</p>
          </div>

          {/* Affichage de l'erreur et du succès */}
          {error && (
            <p style={{ color: "red", textAlign: "center" }}>{error}</p>
          )}
          {successMessage && (
            <p style={{ color: "green", textAlign: "center" }}>
              {successMessage}
            </p>
          )}

          <MDBInput
            wrapperClass="mb-4"
            label="Adresse e-mail"
            id="formControlLg"
            type="email"
            size="lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Mettre à jour l'email
          />
          {/* Input avec icône pour afficher/masquer le mot de passe */}
          <div className="position-relative">
            <MDBInput
              wrapperClass="mb-4"
              label="Mot de passe"
              id="formControlLg"
              type={passwordVisible ? "text" : "password"}
              size="lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <MDBIcon
              icon={passwordVisible ? "eye-slash" : "eye"}
              onClick={() => setPasswordVisible(!passwordVisible)}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            />
          </div>
          <div className="d-flex justify-content-between mb-4">
            <MDBCheckbox
              name="flexCheck"
              value=""
              id="flexCheckDefault"
              label="Se souvenir de moi"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)} // Gérer l'état de "Se souvenir de moi"
            />
            <Link to="/reset-password">Mot de passe oublié ?</Link>
          </div>

          <MDBBtn
            className="mb-0 px-5"
            color="primary"
            size="lg"
            block
            onClick={handleSubmit}
            disabled={loading}
            style={{ textTransform: "none" }}
          >
            {loading ? (
              <>
                <MDBSpinner role="status" size="sm" className="me-2" />
                Chargement...
              </>
            ) : (
              "Se connecter"
            )}
          </MDBBtn>
          <div className="text-center text-md-center mt-4 pt-2">
            <p className="small fw-bold mt-2 pt-1 mb-2">
              Vous n'avez pas de compte ?
              <Link to="/register" className="link-danger">
                S'inscrire
              </Link>
            </p>
          </div>
        </MDBCol>
      </MDBRow>

      <footer className="footer-log">
        <div className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
          <div className="text-white mb-3 mb-md-0">
            © 2025 ReserGo. Tous droits réservés.
          </div>

          <div>
            <MDBBtn
              tag="a"
              color="none"
              className="mx-3"
              style={{ color: "white" }}
            >
              <MDBIcon fab icon="facebook-f" size="md" />
            </MDBBtn>

            <MDBBtn
              tag="a"
              color="none"
              className="mx-3"
              style={{ color: "white" }}
            >
              <MDBIcon fab icon="twitter" size="md" />
            </MDBBtn>

            <MDBBtn
              tag="a"
              color="none"
              className="mx-3"
              style={{ color: "white" }}
            >
              <MDBIcon fab icon="google" size="md" />
            </MDBBtn>

            <MDBBtn
              tag="a"
              color="none"
              className="mx-3"
              style={{ color: "white" }}
            >
              <MDBIcon fab icon="linkedin-in" size="md" />
            </MDBBtn>
          </div>
        </div>
      </footer>
    </MDBContainer>
  );
}

export default Login;
