import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";

import {
  MDBContainer,
  MDBBtn,
  MDBIcon,
  MDBInput,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBBadge,
} from "mdb-react-ui-kit";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import html2pdf from "html2pdf.js";

import "../styles/Pages.css";
import UpdateReservation from "./UpdateReservation";
import Navbar from "./Navbar";
import Footer from "./Footer";

function MesReservations() {
  const [userEmail, setUserEmail] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });
  const [loading, setLoading] = useState(true);

  const [rappels, setRappels] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const filteredRappels = rappels.filter(
    (rappel) =>
      rappel.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(rappel.date)
        .toLocaleString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );
  const navigate = useNavigate();
  useEffect(() => {
    console.log("showModal:", showModal);
  }, [showModal]);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Récupérer les réservations
  const fetchReservations = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:5000/api/protected/reservations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReservations(response.data.reservations);
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations :", error);
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Supprimer une réservation
  const handleConfirmDelete = async (id) => {
    setLoadingDelete(true);
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/protected/reservations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowModal(false);
      setShowToast({
        type: "success",
        visible: true,
        message: "Réservation supprimée !",
      });
      fetchReservations(); 
    } catch (error) {
      console.error("Erreur suppression:", error);
      setShowToast({
        type: "error",
        visible: true,
        message: "Erreur lors de la suppression.",
      });
    } finally {
      setLoadingDelete(false);
      setTimeout(() => setShowToast({ type: "", visible: false }), 3000);
    }
  };

  // Extraire les rappels de chaque réservation
  useEffect(() => {
    const extractedRappels = reservations.flatMap((reservation) => {
      return reservation.rappels.map((rappel) => ({
        reservationId: reservation.id,
        date: rappel,
        message: `Rappel pour la réservation ${reservation.code_reservation}`,
      }));
    });
    setRappels(extractedRappels);
  }, [reservations]);
  const formatDuree = (heuresDecimales) => {
    const totalMinutes = Math.round(parseFloat(heuresDecimales) * 60);
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (isNaN(heures)) return "";
    if (minutes === 0) return `${heures}h`;
    return `${heures}h ${minutes}min`;
  };

  const getMethodePaiement = (paiements, res) => {
    // Si la liste des paiements est vide ou nulle, retourner res.mode_paiement
    if (!paiements || paiements.length === 0) {
      return res.mode_paiement || "-"; // Si mode_paiement est défini, le retourner, sinon "-"
    }
    // Sinon, retourner les méthodes de paiement séparées par des virgules
    return paiements.map((p) => p.methode).join(", ");
  };

  const handleExportCSV = () => {
    const headers = [
      "Code",
      "Date",
      "Durée",
      "Service",
      "Espace",
      "Montant de l'espace",
      "Montant payé",
      "Mode de paiement", // Nouvelle colonne ajoutée
      "Participants",
    ];

    const rows = reservations.map((res) => [
      res.code_reservation,
      new Date(res.date).toLocaleString(),
      formatDuree(res.duree),
      res.service,
      res.spaceName,
      res.spaceMontant,
      res.montant, // Montant payé
      getMethodePaiement(res.paiements, res), // Mode de paiement
      res.participants,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mes_reservations.csv";
    a.click();

    // Afficher un message de réussite après l'exportation
    setShowToast({
      type: "success",
      visible: true,
      message: "Export CSV effectué !",
    });
    setTimeout(() => setShowToast({ type: "", visible: false }), 3000);
  };

  const handleExportPDF = () => {
    const element = document.getElementById("reservations-table");

    // Option d'exportation avec le mode de paiement et le montant payé
    const opt = {
      margin: 0.3,
      filename: "mes_reservations.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "in",
        format: "letter",
        orientation: "portrait",
      },
    };

    html2pdf().set(opt).from(element).save();

    // Afficher un message de réussite après l'exportation
    setShowToast({
      type: "success",
      visible: true,
      message: "Export PDF effectué !",
    });
    setTimeout(() => setShowToast({ type: "", visible: false }), 3000);
  };

  const filteredReservations = reservations.filter(
    (res) =>
      // Recherche dans tous les champs pertinents
      res.code_reservation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.duree.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.spaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.spaceLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.participants.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.spaceMontant
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) // pour les montants
  );

  return (
    <MDBContainer fluid className="dashboard-bg px-0">
      {/* Navbar */}
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

      {/* Main Content */}
      <MDBContainer className="py-5 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-primary fw-bold">Mes Réservations</h3>
          <div className="d-flex gap-2">
            <MDBInput
              label="Rechercher..."
              size="sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MDBBtn size="sm" color="success" onClick={handleExportCSV}>
              <MDBIcon icon="file-csv" />
            </MDBBtn>
            <MDBBtn size="sm" color="danger" onClick={handleExportPDF}>
              <MDBIcon icon="file-pdf" />
            </MDBBtn>
          </div>
        </div>

        {filteredReservations.length === 0 ? (
          <div className="text-center py-5 justify-content-center align-items-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt="Aucune réservation"
              style={{
                width: "180px",
                marginBottom: "20px",
                opacity: 0.7,
                marginLeft: "42%",
              }}
            />
            <h5 className="mt-3 text-muted">Aucune réservation trouvée</h5>
            <Link to="/reserver">
              <MDBBtn
                color="primary"
                className="mt-3"
                style={{ textTransform: "none" }}
              >
                Faire une réservation
              </MDBBtn>
            </Link>
          </div>
        ) : (
          <div
            style={{ maxHeight: "600px", overflowY: "auto" }}
            id="reservations-table"
          >
            <MDBTable striped hover responsive>
              <MDBTableHead
                className=" text-blue-800 text-center"
                style={{ fontWeight: "bold", fontSize: "1.0rem" }}
              >
                <tr>
                  <th>Code</th>
                  <th>Date</th>
                  <th>Durée</th>
                  <th>Service</th>
                  <th>Montant</th>
                  <th>Payé</th>
                  <th>Méthode</th>
                  <th>Participants</th>
                  <th>status</th>
                  <th>Espace</th>
                  <th>Actions</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody className="text-center">
                {filteredReservations.map((res) => (
                  <tr key={res.id}>
                    <td>
                      <strong>{res.code_reservation}</strong>
                    </td>
                    <td>{new Date(res.date).toLocaleDateString("fr-FR")}</td>
                    <td>{formatDuree(res.duree)}</td>
                    <td>{res.service}</td>
                    <td>{res.spaceMontant} €</td>
                    <td>{res.montant} €</td>
                    <td>{getMethodePaiement(res.paiements, res)}</td>
                    <td>{res.participants}</td>
                    <td>
                      {" "}
                      {res.status === "annulation demandée" && (
                        <MDBBadge color="warning" className="ms-2">
                          A annulée{" "}
                        </MDBBadge>
                      )}
                      {res.status === "annulée" && (
                        <MDBBadge color="danger" className="ms-2">
                          Annulée
                        </MDBBadge>
                      )}
                      {res.status === "En attente" && (
                        <MDBBadge color="warning" className="ms-2">
                          A confirmée
                        </MDBBadge>
                      )}
                      {res.status === "acceptée" && (
                        <MDBBadge color="success" className="ms-2">
                          Confirmée
                        </MDBBadge>
                      )}
                      {res.status === "refusée" && (
                        <MDBBadge color="danger" className="ms-2">
                          Refusée
                        </MDBBadge>
                      )}
                    </td>
                    <td>
                      {res.spaceName} ({res.spaceLocation})
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <MDBBtn
                          size="sm"
                          color="secondary"
                          onClick={() => {
                            setSelectedReservationId(res.id);
                            setShowUpdateModal(true);
                          }}
                        >
                          <MDBIcon fas icon="pen" />
                        </MDBBtn>

                        <MDBBtn
                          size="sm"
                          color="danger"
                          onClick={() => {
                            setReservationToDelete(res.id);
                            setShowModal(true);
                          }}
                        >
                          <MDBIcon fas icon="trash" />
                        </MDBBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </MDBTableBody>
            </MDBTable>
          </div>
        )}
      </MDBContainer>

      {/* Modal */}
      <MDBModal open={showModal} onClose={setShowModal}>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Confirmer la suppression</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowModal(false)}
              />
            </MDBModalHeader>
            <MDBModalBody>
              Êtes-vous sûr de vouloir supprimer cette réservation ?
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn
                color="secondary"
                style={{ textTransform: "none" }}
                onClick={() => setShowModal(false)}
              >
                Annuler
              </MDBBtn>
              <MDBBtn
                color="danger"
                onClick={() => handleConfirmDelete(reservationToDelete)}
                style={{ textTransform: "none" }}
                disabled={loadingDelete}
              >
                {loadingDelete ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
      {/* Section des rappels */}
      <MDBContainer className="py-5 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-primary fw-bold">Mes Rappels</h3>
        </div>

        {filteredRappels.length === 0 ? (
          <div className="text-center py-5 justify-content-center align-items-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt="Aucun rappel"
              style={{
                width: "180px",
                marginBottom: "20px",
                opacity: 0.7,
                marginLeft: "42%",
              }}
            />
            <h5 className="mt-3 text-muted">Aucun rappel trouvé</h5>
          </div>
        ) : (
          <div
            style={{ maxHeight: "600px", overflowY: "auto" }}
            id="rappels-table"
          >
            <MDBTable striped hover responsive>
              <MDBTableHead
                className=" text-blue-800 text-center"
                style={{ fontWeight: "bold", fontSize: "1.0rem" }}
              >
                <tr>
                  <th>Date</th>
                  <th>Message</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody className=" text-center">
                {filteredRappels.map((rappel) => (
                  <tr key={rappel.reservationId}>
                    <td>{new Date(rappel.date).toLocaleString()}</td>
                    <td>{rappel.message}</td>
                  </tr>
                ))}
              </MDBTableBody>
            </MDBTable>
          </div>
        )}
      </MDBContainer>
      {showUpdateModal && selectedReservationId && (
        <UpdateReservation
          reservationId={selectedReservationId}
          onClose={(refresh = false) => {
            setShowUpdateModal(false);
            setSelectedReservationId(null);
            if (refresh) fetchReservations(); 
          }}
          showModal={showUpdateModal}
        />
      )}

      <Footer />
    </MDBContainer>
  );
}

export default MesReservations;
