import React, { useState } from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBBtn,
  MDBIcon,
  MDBInput,
  MDBSpinner,
} from "mdb-react-ui-kit";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import "../styles/Pages.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import { useNavigate } from "react-router-dom";
import logo from "../../images/logo.png";
import LanguageDropdown from "../LanguageDropdown";

import { useTranslation } from "react-i18next";
function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let errors = { ...formErrors };

    switch (id) {
      case "firstName":
        setFirstName(value);
        errors.firstName = value ? "" : t("validation_first_name");
        break;
      case "lastName":
        setLastName(value);
        errors.lastName = value ? "" : t("validation_last_name");
        break;
      case "username":
        setUsername(value);
        errors.username = value ? "" : t("validation_username");
        break;
      case "email":
        setEmail(value);
        errors.email = value
          ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ? ""
            : t("validation_email_invalid")
          : t("validation_email_required");
        break;
      case "password":
        setPassword(value);
        errors.password = value
          ? validatePassword(value)
            ? ""
            : t("validation_password_format")
          : t("validation_password_required");
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        errors.confirmPassword = value
          ? value === password
            ? ""
            : t("validation_confirm_mismatch")
          : t("validation_confirm_required");
        break;
      default:
        break;
    }

    setFormErrors(errors);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (Object.values(formErrors).some((error) => error !== "")) {
      setError(t("validation_form_error"));
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        username,
        email,
        role: "user",
        createdAt: new Date(),
      });

      setSuccessMessage(t("success_register"));
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError(t("email_in_use"));
      } else {
        setError(t("register_error"));
      }
      console.error(t("register_error"), err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          username: user.displayName || user.email?.split("@")[0],
          email: user.email,
          createdAt: new Date(),
        });
      }

      setSuccessMessage(t("google_success"));
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err) {
      console.error(t("google_error"), err);
      setError(t("google_error"));
    }
  };

  return (
    <MDBContainer fluid className="p-4 my-3 h-custom">
      <div className="d-flex justify-content-end px-4 pt-3">
        <LanguageDropdown />
      </div>
      <MDBRow>
        <MDBCol col="10" md="6">
          <img
            src="https://plus.unsplash.com/premium_photo-1663076518116-0f0637626edf?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="img-fluid"
            alt="Illustration d'inscription"
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
                marginTop: "-15%",
              }}
            />
          </div>

          <div className="d-flex flex-row align-items-center justify-content-center">
            <p className="lead fw-normal mb-0 me-3">{t("register_with")}</p>
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
            <p className="text-center fw-bold mx-3 mb-0">{t("or")}</p>
          </div>

          {error && (
            <p style={{ color: "red", textAlign: "center" }}>{error}</p>
          )}
          {successMessage && (
            <p style={{ color: "green", textAlign: "center" }}>
              {successMessage}
            </p>
          )}

          <MDBRow className="mb-4">
            <MDBCol md="6">
              <MDBInput
                label={t("first_name")}
                id="firstName"
                type="text"
                size="lg"
                value={firstName}
                onChange={handleInputChange}
              />
              {formErrors.firstName && (
                <p style={{ color: "red" }}>{formErrors.firstName}</p>
              )}
            </MDBCol>
            <MDBCol md="6">
              <MDBInput
                label={t("last_name")}
                id="lastName"
                type="text"
                size="lg"
                value={lastName}
                onChange={handleInputChange}
              />
              {formErrors.lastName && (
                <p style={{ color: "red" }}>{formErrors.lastName}</p>
              )}
            </MDBCol>
          </MDBRow>

          <MDBInput
            wrapperClass="mb-4"
            label={t("username")}
            id="username"
            type="text"
            size="lg"
            value={username}
            onChange={handleInputChange}
          />
          {formErrors.username && (
            <p style={{ color: "red" }}>{formErrors.username}</p>
          )}

          <MDBInput
            wrapperClass="mb-4"
            label={t("email")}
            id="email"
            type="email"
            size="lg"
            value={email}
            onChange={handleInputChange}
          />
          {formErrors.email && (
            <p style={{ color: "red" }}>{formErrors.email}</p>
          )}

          <MDBRow className="mb-4">
            <MDBCol md="6">
              <div className="position-relative">
                <MDBInput
                  label={t("password")}
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  size="lg"
                  value={password}
                  onChange={handleInputChange}
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
              {formErrors.password && (
                <p style={{ color: "red" }}>{formErrors.password}</p>
              )}
            </MDBCol>

            <MDBCol md="6">
              <div className="position-relative">
                <MDBInput
                  label={t("confirm_password")}
                  id="confirmPassword"
                  type={confirmPasswordVisible ? "text" : "password"}
                  size="lg"
                  value={confirmPassword}
                  onChange={handleInputChange}
                />
                <MDBIcon
                  icon={confirmPasswordVisible ? "eye-slash" : "eye"}
                  onClick={() =>
                    setConfirmPasswordVisible(!confirmPasswordVisible)
                  }
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                  }}
                />
              </div>
              {formErrors.confirmPassword && (
                <p style={{ color: "red" }}>{formErrors.confirmPassword}</p>
              )}
            </MDBCol>
          </MDBRow>

          <MDBBtn
            className="mb-0 px-5"
            color="primary"
            size="lg"
            block
            onClick={handleRegister}
            disabled={loading}
            style={{ textTransform: "none" }}
          >
            {loading ? (
              <>
                <MDBSpinner role="status" size="sm" className="me-2" />
                {t("loading")}{" "}
              </>
            ) : (
              t("sign_up")
            )}
          </MDBBtn>

          <div className="text-center text-md-center mt-4 pt-2">
            <p className="small fw-bold mt-2 pt-1 mb-2">
              {t("already_have_account")}{" "}
              <a href="/login" className="link-danger">
                {t("login")}
              </a>
            </p>
          </div>
        </MDBCol>
      </MDBRow>

      <footer className="footer-log">
        <div className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
          <div className="text-white mb-3 mb-md-0">{t("copyright")}</div>

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

export default Register;
