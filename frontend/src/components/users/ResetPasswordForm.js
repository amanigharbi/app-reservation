import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { confirmPasswordReset } from "firebase/auth";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBBtn,
  MDBInput,
  MDBIcon,
} from "mdb-react-ui-kit";
import logo from "../../images/logo.png"; // Importer le logo
import { Link } from "react-router-dom";

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(location.search);
  const oobCode = urlParams.get("oobCode"); // 'oobCode' est le code de réinitialisation dans l'URL

  useEffect(() => {
    if (!oobCode) {
      setError("Code de réinitialisation invalide.");
    }
  }, [oobCode]);

  const validatePassword = (password) => {
    const minLength = 6;
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (password.length < minLength)
      return "Le mot de passe doit contenir au moins 6 caractères.";
    if (!regex.test(password))
      return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Veuillez entrer les deux mots de passe.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage("Le mot de passe a été réinitialisé avec succès.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/expired-action-code") {
        setError("Le lien de réinitialisation a expiré.");
      } else if (err.code === "auth/invalid-action-code") {
        setError("Le code de réinitialisation est invalide.");
      } else {
        setError("Une erreur s'est produite. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
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

          <h3 className="text-center mb-4">Réinitialiser votre mot de passe</h3>

          {error && (
            <p style={{ color: "red", textAlign: "center" }}>{error}</p>
          )}
          {message && (
            <p style={{ color: "green", textAlign: "center" }}>{message}</p>
          )}

          <div className="position-relative">
            <MDBInput
              wrapperClass="mb-4"
              label="Nouveau mot de pass"
              id="formControlLg"
              type={passwordVisible ? "text" : "password"}
              size="lg"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
          <div className="position-relative">
            <MDBInput
              wrapperClass="mb-4"
              label="Confirmer le mot de passe"
              id="formControlLg"
              type={passwordVisible ? "text" : "password"}
              size="lg"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          <div className="text-center text-md-center mt-4 pt-2">
            <MDBBtn
              className="mb-0 px-5"
              size="lg"
              onClick={handleSubmit}
              style={{ textTransform: "none" }}
              disabled={loading}
            >
              {loading
                ? "Réinitialisation en cours..."
                : "Réinitialiser le mot de passe"}
            </MDBBtn>
          </div>

          <div className="text-center mt-3">
            <p>
              Retour à la page de{" "}
              <Link to="/login" className="link-danger">
                connexion
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

export default ResetPasswordForm;
