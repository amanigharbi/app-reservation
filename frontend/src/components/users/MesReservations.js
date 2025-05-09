import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/Pages.css";
import UpdateReservation from "./UpdateReservation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useTranslation } from "react-i18next";

function MesReservations() {
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [showToast, setShowToast] = useState({
    type: "",
    visible: false,
    message: "",
  });
  // eslint-disable-next-line
  const [loading, setLoading] = useState(false);
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
  useEffect(() => {}, [showModal]);
  const { t } = useTranslation();

  const [loadingDelete, setLoadingDelete] = useState(false);

  // Récupérer les réservations

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL + "/api/protected/reservations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReservations(response.data.reservations);
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations :", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  }, [navigate]); // Include all dependencies used inside the callback

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]); // Now the dependency is stable

  // Supprimer une réservation
  const handleConfirmDelete = async (id) => {
    setLoadingDelete(true);
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        process.env.REACT_APP_API_URL + `/api/protected/reservations/${id}`,
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
        message: t("reservation_deleted"),
      });
      fetchReservations();
    } catch (error) {
      console.error(t("delete_error"), error);
      setShowToast({
        type: "error",
        visible: true,
        message: t("delete_error"),
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
        message: `${t("reminder_of")} ${reservation.code_reservation}`,
      }));
    });
    setRappels(extractedRappels);
  }, [reservations,t]);
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
      t("code"),
      t("date"),
      t("duration"),
      t("service"),
      t("space"),
      t("amount"),
      t("paid"),
      t("payment"),
      t("participants"),
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
      message: t("csv_exported"),
    });
    setTimeout(() => setShowToast({ type: "", visible: false }), 3000);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(t("my_reservations"), 14, 15);

    const headers = [
      [
        t("code"),
        t("date"),
        t("duration"),
        t("service"),
        t("space"),
        t("amount"),
        t("paid"),
        t("payment"),
        t("participants"),
        t("status"),
      ],
    ];

    const rows = reservations.map((res) => [
      res.code_reservation,
      new Date(res.date).toLocaleDateString("fr-FR"),
      formatDuree(res.duree),
      res.service,
      `${res.spaceMontant} €`,
      `${res.montant} €`,
      getMethodePaiement(res.paiements, res),
      res.participants,
      `${res.spaceName} (${res.spaceLocation})`,
      res.status,
    ]);

    autoTable(doc, {
      startY: 25,
      head: headers,
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [52, 152, 219] },
    });

    doc.save("mes_reservations.pdf");

    setShowToast({
      type: "success",
      visible: true,
      message: t("pdf_exported"),
    });

    setTimeout(() => setShowToast({ type: "", visible: false }), 3000);
  };

  const filteredReservations = reservations.filter(
    (res) =>
      // Recherche dans tous les champs pertinents
      res.code_reservation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.duree?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "annulation demandée":
        return (
          <MDBBadge color="warning" className="ms-2">
            {t("to_cancled")}
          </MDBBadge>
        );
      case "confirmée":
      case "acceptée":
        return (
          <MDBBadge color="success" className="ms-1">
            {t("confirmed")}
          </MDBBadge>
        );
      case "annulée":
        return (
          <MDBBadge color="danger" className="ms-1">
            {t("cancled")}{" "}
          </MDBBadge>
        );
      case "en attente":
        return (
          <MDBBadge color="dark" className="ms-1">
            {t("pending")}{" "}
          </MDBBadge>
        );
      case "refusée":
        return (
          <MDBBadge color="danger" className="ms-1">
            {t("refused")}{" "}
          </MDBBadge>
        );
      case "archivé":
        return (
          <MDBBadge color="secondary" className="ms-1">
            {t("archived")}{" "}
          </MDBBadge>
        );
      default:
        return (
          <MDBBadge color="light" className="ms-1">
            {t("unknown")}{" "}
          </MDBBadge>
        );
    }
  };
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
              {showToast.message || t("default_action_message")}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <MDBContainer className="py-5 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-primary fw-bold"> {t("my_reservations")}</h3>
          <div className="d-flex gap-2">
            <MDBInput
              label={t("search")}
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
              alt={t("no_reservation_title")}
              style={{
                width: "180px",
                marginBottom: "20px",
                opacity: 0.7,
                marginLeft: "42%",
              }}
            />
            <h5 className="mt-3 text-muted">{t("no_reservation_title")}</h5>
            <Link to="/reserver">
              <MDBBtn
                color="primary"
                className="mt-3"
                style={{ textTransform: "none" }}
              >
                {t("make_reservation")}{" "}
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
                  <th>{t("code")}</th>
                  <th>{t("date")}</th>
                  <th>{t("duration")}</th>
                  <th>{t("service")}</th>
                  <th>{t("amount")}</th>
                  <th>{t("paid")}</th>
                  <th>{t("method")}</th>
                  <th>{t("participants")}</th>
                  <th>{t("status")}</th>
                  <th>{t("space")}</th>
                  <th>{t("actions")}</th>
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
                    <td>{getStatusBadge(res.status)}</td>
                    <td>
                      {res.spaceName} ({res.spaceLocation})
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        {res.status.toLowerCase() !== "archivé" &&
                          res.status.toLowerCase() !== "annulée" &&
                          res.status.toLowerCase() !== "refusée" && (
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
                          )}

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
              <MDBModalTitle>{t("confirm_delete")}</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setShowModal(false)}
              />
            </MDBModalHeader>
            <MDBModalBody>{t("confirm_delete_message")} </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn
                color="secondary"
                style={{ textTransform: "none" }}
                onClick={() => setShowModal(false)}
              >
                {t("cancel")}
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
                    {t("deleting")}
                  </>
                ) : (
                  t("delete")
                )}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
      {/* Section des rappels */}
      <MDBContainer className="py-5 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-primary fw-bold">{t("my_reminders")}</h3>
        </div>

        {filteredRappels.length === 0 ? (
          <div className="text-center py-5 justify-content-center align-items-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt={t("no_reminders")}
              style={{
                width: "180px",
                marginBottom: "20px",
                opacity: 0.7,
                marginLeft: "42%",
              }}
            />
            <h5 className="mt-3 text-muted">{t("no_reminders")}</h5>
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
                {filteredRappels.map((rappel, index) => (
                  <tr key={`${rappel.reservationId}-${index}`}>
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
