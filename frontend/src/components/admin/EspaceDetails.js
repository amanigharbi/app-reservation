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

function EspaceDetails() {
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
        console.error(
          "Erreur lors du chargement des détails de l'espace:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    if (spaceId && token) loadSpaceDetails();
  }, [spaceId, token]);

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
        message: "Espace supprimé avec succès.",
      });

      setTimeout(() => {
        navigate("/admin/espaces"); // Rediriger après suppression
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'espace:", error);
      showToastWithTimeout({
        type: "error",
        message: "Erreur lors de la suppression de l'espace.",
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
          setErrorMessage("Veuillez définir les heures de disponibilité.");
          return;
        }

        if (fromTime >= toTime) {
          setErrorMessage(
            "L'heure de début doit être inférieure à l'heure de fin."
          );
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
        message: "Disponibilité mise à jour avec succès.",
      });

      setShowAvailabilityModal(false); // Fermer la modale si tout est OK
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de la disponibilité :",
        error
      );
      showToastWithTimeout({
        type: "error",
        message: "Échec de la mise à jour de la disponibilité.",
      });
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const toggleModal = () => setShowModal(!showModal);

  if (loading) return <div className="text-center py-5">Chargement...</div>;

  // Format de l'heure: HH:mm
  const formatTime = (time) => {
    return time
      ? new Date(`1970-01-01T${time}Z`).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Non renseigné";
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
              Retour à la liste des espaces
            </MDBBtn>
          </div>

          {/* Titre avec badge de disponibilité */}
          <MDBCardTitle className="text-primary fs-3 mb-4 d-flex align-items-center justify-content-between">
            <div>
              <MDBIcon icon="building" className="me-2" />
              Détails de l'espace{" "}
              <strong>{spaceDetails.name || "Espace inconnu"}</strong>
            </div>
            <span
              className={`badge ${
                spaceDetails.available ? "bg-success" : "bg-danger"
              } ms-3`}
            >
              {spaceDetails.available ? "Disponible" : "Non disponible"}
            </span>
          </MDBCardTitle>

          {/* Détails de l'espace */}
          <MDBRow>
            <MDBCol md="6" className="mb-3">
              <strong>Nom :</strong> {spaceDetails.name || "Non renseigné"}
            </MDBCol>
            <MDBCol md="6" className="mb-3">
              <strong>Prix de l'espace :</strong>{" "}
              {spaceDetails.montant || "Non renseigné"} (€)
            </MDBCol>
            <MDBCol md="6" className="mb-3">
              <strong>Capacité :</strong>{" "}
              {spaceDetails.capacity || "Non renseigné"}
            </MDBCol>
            <MDBCol md="6" className="mb-3">
              <strong>Localisation :</strong>{" "}
              {spaceDetails.location || "Non renseigné"}
            </MDBCol>

            {spaceDetails.available && (
              <MDBRow>
                <MDBCol md="6" className="mb-3">
                  <strong>Disponible à partir de :</strong>{" "}
                  {formatTime(spaceDetails.availableFrom)}
                </MDBCol>

                <MDBCol md="6" className="mb-3">
                  <strong>Jusqu'au :</strong>{" "}
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
              {spaceDetails.available
                ? "Rendre non disponible"
                : "Rendre disponible"}
            </MDBBtn>

            <MDBBtn
              color="danger"
              style={{ textTransform: "none" }}
              onClick={toggleModal}
            >
              Supprimer l'espace
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
              {showToast.message || "Une action a été effectuée."}
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
              <MDBModalTitle>Définir la période de disponibilité</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowAvailabilityModal(false)}
              />
            </MDBModalHeader>
            <MDBModalBody>
              <label>Disponible à partir de :</label>
              <input
                type="time"
                className="form-control mb-3"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
              />

              <label>Disponible jusqu'au :</label>
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
                Annuler
              </MDBBtn>
              <MDBBtn
                style={{ textTransform: "none" }}
                color="success"
                onClick={() => {
                  // Vérification avant soumission
                  if (availableFrom >= availableTo) {
                    setErrorMessage(
                      "L'heure de début doit être inférieure à l'heure de fin."
                    );
                    return;
                  }

                  handleAvailabilityUpdate(true, availableFrom, availableTo);
                  setShowAvailabilityModal(false);
                }}
                disabled={updatingAvailability}
              >
                Sauvegarder
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
              <MDBModalTitle>Confirmer la suppression</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={toggleModal}
              />
            </MDBModalHeader>
            <MDBModalBody>
              Êtes-vous sûr de vouloir supprimer cet espace ?
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={toggleModal}>
                Annuler
              </MDBBtn>
              <MDBBtn
                color="danger"
                onClick={handleDelete}
                disabled={loadingDelete}
              >
                {loadingDelete ? "Suppression en cours..." : "Supprimer"}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </MDBContainer>
  );
}

export default EspaceDetails;
