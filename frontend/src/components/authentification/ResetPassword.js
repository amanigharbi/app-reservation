import React, { useState } from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBBtn,
  MDBInput,
  MDBIcon,
  MDBSpinner,
} from "mdb-react-ui-kit";
import { auth, db } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import "../styles/Pages.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import logo from "../../images/logo.png";
import { useTranslation } from "react-i18next";
import LanguageDropdown from "../LanguageDropdown";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError(t("reset_email_required"));
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", "==", email.trim().toLowerCase())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError(t("reset_email_not_found"));
        return;
      }

      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setMessage(t("reset_email_sent"));
    } catch (err) {
      console.error(err);
      setError(t("reset_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MDBContainer fluid className="p-12 my-5 h-custom">
      <div className="d-flex justify-content-end px-4 pt-3">
        <LanguageDropdown />
      </div>
      <MDBRow>
        <MDBCol col="10" md="6">
          <img
            src="https://plus.unsplash.com/premium_photo-1663076518116-0f0637626edf?q=80&w=1932&auto=format&fit=crop"
            className="img-fluid"
            alt="Reset password illustration"
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

          <h3 className="text-center mb-4">{t("reset_title")}</h3>

          {error && (
            <p style={{ color: "red", textAlign: "center" }}>{error}</p>
          )}
          {message && (
            <p style={{ color: "green", textAlign: "center" }}>{message}</p>
          )}

          <MDBInput
            wrapperClass="mb-4"
            label={t("email")}
            id="formControlLg"
            type="email"
            size="lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="text-center text-md-center mt-4 pt-2">
            <MDBBtn
              className="mb-0 px-5"
              size="lg"
              onClick={handleSubmit}
              disabled={loading}
              style={{ textTransform: "none" }}
            >
              {loading ? (
                <>
                  <MDBSpinner role="status" size="sm" className="me-2" />
                  {t("sending")}
                </>
              ) : (
                t("send_reset_link")
              )}
            </MDBBtn>
          </div>

          <div className="text-center mt-3">
            <p>
              {t("back_to")}{" "}
              <Link to="/login" className="link-danger">
                {t("login")}
              </Link>
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

export default ResetPassword;
