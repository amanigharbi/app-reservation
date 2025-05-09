import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchSpacesById,
  updateSpace,
  deleteSpace,
} from "../../services/spaces.api";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBBtn,
  MDBIcon,
  MDBRow,
  MDBCol,
  MDBModal,
  MDBModalBody,
  MDBModalFooter,
  MDBModalHeader,
  MDBModalDialog,
  MDBModalContent,
  MDBModalTitle,
} from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";

function EspaceDetails() {
  const { t } = useTranslation();

  const { spaceId } = useParams();
  const navigate = useNavigate();
  const [spaceDetails, setSpaceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [showToast, setShowToast] = useState({
    visible: false,
    message: "",
    type: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const token = localStorage.getItem("token");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadSpaceDetails = async () => {
      try {
        const res = await fetchSpacesById(token, spaceId);
        setSpaceDetails(res);
      } catch (error) {
        console.error(t("error_space_data"), error);
      } finally {
        setLoading(false);
      }
    };

    if (spaceId && token) loadSpaceDetails();
  }, [spaceId, token,t]);

  const showToastWithTimeout = ({ type, message }) => {
    setShowToast({ type, visible: true, message });

    setTimeout(() => {
      setShowToast({ type: "", visible: false, message: "" });
    }, 2000);
  };

  const handleDelete = async () => {
    try {
      setLoadingDelete(true);
      await deleteSpace(token, spaceId);
      showToastWithTimeout({
        type: "success",
        message: t("success_delete_space"),
      });

      setTimeout(() => {
        navigate("/admin/espaces"); // Rediriger après suppression
      }, 2000);
    } catch (error) {
      console.error(t("error_delete_space"), error);
      showToastWithTimeout({
        type: "error",
        message: t("error_delete_space"),
      });
    }
    setShowModal(false); // Fermer la modale après suppression
  };

  const handleAvailabilityUpdate = async (
    available,
    fromTime = null,
    toTime = null
  ) => {
    try {
      // Validation si on rend disponible
      if (available) {
        if (!fromTime?.trim() || !toTime?.trim()) {
          setErrorMessage(t("error_dispo_time"));
          return;
        }

        if (fromTime >= toTime) {
          setErrorMessage(t("error_inf"));
          return;
        }

        setErrorMessage(""); // Réinitialiser l'erreur
      }

      setUpdatingAvailability(true);

      // Préparer les données à envoyer
      const updatedSpace = {
        ...spaceDetails,
        available,
        availableFrom: available ? fromTime : null,
        availableTo: available ? toTime : null,
      };

      await updateSpace(token, spaceId, updatedSpace);
      setSpaceDetails(updatedSpace); // Mettre à jour l'état local

      showToastWithTimeout({
        type: "success",
        message: t("success_update_dispo"),
      });

      setShowAvailabilityModal(false); // Fermer la modale si tout est OK
    } catch (error) {
      console.error(t("eror_update_dispo"), error);
      showToastWithTimeout({
        type: "error",
        message: t("eror_update_dispo"),
      });
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const toggleModal = () => setShowModal(!showModal);

  if (loading) return <div className="text-center py-5">{t("loading")}</div>;

  // Format de l'heure: HH:mm
  const formatTime = (time) => {
    return time
      ? new Date(`1970-01-01T${time}Z`).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : t("auc");
  };

  return (
    <MDBContainer className="py-0">
      <MDBCard className="shadow border bg-white">
        <MDBCardBody>
          {/* Bouton Retour */}
          <div className="mb-4 text-start">
            <MDBBtn
              color="secondary"
              onClick={() => navigate("/admin/espaces")}
              size="sm"
              style={{ textTransform: "none" }}
            >
              <MDBIcon icon="arrow-left" className="me-2" />
              {t("return")}
            </MDBBtn>
          </div>

          {/* Titre avec badge de disponibilité */}
          <MDBCardTitle className="text-primary fs-3 mb-4 d-flex align-items-center justify-content-between">
            <div>
              <MDBIcon icon="building" className="me-2" />
              {t("space_details")}{" "}
              <strong>{spaceDetails.name || t("space_unknow")}</strong>
            </div>
            <span
              className={`badge ${
                spaceDetails.available ? "bg-success" : "bg-danger"
              } ms-3`}
            >
              {spaceDetails.available ? t("dispo") : t("no_dispo")}
            </span>
          </MDBCardTitle>

          {/* Détails de l'espace */}
          <MDBRow>
            <MDBCol md="6" className="mb-3">
              <strong>{t("name_space")} :</strong>{" "}
              {spaceDetails.name || t("auc")}
            </MDBCol>
            <MDBCol md="6" className="mb-3">
              <strong>{t("price")} :</strong> {spaceDetails.montant || t("auc")}{" "}
              (€)
            </MDBCol>
            <MDBCol md="6" className="mb-3">
              <strong>{t("capacity")} :</strong>{" "}
              {spaceDetails.capacity || t("auc")}
            </MDBCol>
            <MDBCol md="6" className="mb-3">
              <strong>{t("location")} :</strong>{" "}
              {spaceDetails.location || t("auc")}
            </MDBCol>

            {spaceDetails.available && (
              <MDBRow>
                <MDBCol md="6" className="mb-3">
                  <strong>{t("dispo_from")}:</strong>{" "}
                  {formatTime(spaceDetails.availableFrom)}
                </MDBCol>

                <MDBCol md="6" className="mb-3">
                  <strong>{t("dispo_to")} :</strong>{" "}
                  {formatTime(spaceDetails.availableTo)}
                </MDBCol>
              </MDBRow>
            )}
          </MDBRow>

          {/* Actions */}
          <div className="mt-5 d-flex gap-3">
            <MDBBtn
              color="warning"
              style={{ textTransform: "none" }}
              onClick={() => {
                if (spaceDetails.available) {
                  // Confirmation avant de rendre non disponible
                  handleAvailabilityUpdate(false);
                } else {
                  // Afficher la modale pour définir les horaires de disponibilité
                  setShowAvailabilityModal(true);
                }
              }}
              disabled={updatingAvailability}
            >
              {spaceDetails.available ? t("make_no_dispo") : t("make_dispo")}
            </MDBBtn>

            <MDBBtn
              color="danger"
              style={{ textTransform: "none" }}
              onClick={toggleModal}
            >
              {t("delete_space")}
            </MDBBtn>
          </div>
        </MDBCardBody>
      </MDBCard>

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

      {/* Modal de disponibilité */}
      <MDBModal
        open={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
      >
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{t("add_dispo")}</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowAvailabilityModal(false)}
              />
            </MDBModalHeader>
            <MDBModalBody>
              <label>{t("dispo_from")} :</label>
              <input
                type="time"
                className="form-control mb-3"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
              />

              <label>{t("dispo_to")} :</label>
              <input
                type="time"
                className="form-control mb-3"
                value={availableTo}
                onChange={(e) => setAvailableTo(e.target.value)}
              />

              {/* Affichage du message d'erreur sous l'input */}
              {errorMessage && (
                <div
                  style={{
                    color: "red",
                    fontSize: "0.875rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {errorMessage}
                </div>
              )}
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn
                color="secondary"
                onClick={() => setShowAvailabilityModal(false)}
                style={{ textTransform: "none" }}
              >
                {t("cancel")}
              </MDBBtn>
              <MDBBtn
                style={{ textTransform: "none" }}
                color="success"
                onClick={() => {
                  // Vérification avant soumission
                  if (availableFrom >= availableTo) {
                    setErrorMessage(t("error_inf"));
                    return;
                  }

                  handleAvailabilityUpdate(true, availableFrom, availableTo);
                  setShowAvailabilityModal(false);
                }}
                disabled={updatingAvailability}
              >
                {t("save")}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Modal de confirmation de suppression */}
      <MDBModal open={showModal} onClose={toggleModal}>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{t("confirm_delete")}</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={toggleModal}
              />
            </MDBModalHeader>
            <MDBModalBody>{t("confirm_delete_space")} </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={toggleModal}>
                {t("cancel")}
              </MDBBtn>
              <MDBBtn
                color="danger"
                onClick={handleDelete}
                disabled={loadingDelete}
              >
                {loadingDelete ? t("deleting") : t("delete")}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </MDBContainer>
  );
}

export default EspaceDetails;
