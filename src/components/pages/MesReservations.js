import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
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
} from "mdb-react-ui-kit";
import logo from "../../images/logo-3.png";
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

function MesReservations() {
  const [userEmail, setUserEmail] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false); // Modal state
  const [reservationToDelete, setReservationToDelete] = useState(null); // Reservation to delete
  const [showToast, setShowToast] = useState({ type: "", visible: false });

  const navigate = useNavigate();
  useEffect(() => {
    console.log("showModal:", showModal); // Affichez la valeur de showModal
  }, [showModal]);
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email);
        const q = query(
          collection(db, "reservations"),
          where("utilisateurId", "==", currentUser.uid)
        );
        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          const reservationList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setReservations(reservationList);
        });
        return () => unsubscribeFirestore();
      } else {
        setUserEmail(null);
        navigate("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const handleUpdateReservation = (reservation) => {
    navigate(`/update-reservation/${reservation.id}`, {
      state: { reservation },
    });
  };

  const handleDeleteReservation = (id) => {
    console.log(
      "Ouverture du modal pour la suppression de la réservation:",
      id
    );
    setReservationToDelete(id); // Set the reservation to delete
    setShowModal(true); // Show the modal
  };

  const handleConfirmDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "reservations", id));
      setShowModal(false);
      setShowToast({ type: "success", visible: true });
      setTimeout(() => setShowToast({ type: "", visible: false }), 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      setShowModal(false);
      setShowToast({ type: "error", visible: true });
      setTimeout(() => setShowToast({ type: "", visible: false }), 3000);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Code",
      "Date",
      "Durée",
      "Service",
      "Espace",
      "Montant",
      "Participants",
    ];
    const rows = reservations.map((res) => [
      res.code_reservation,
      new Date(res.date).toLocaleString(),
      res.duree,
      res.service,
      res.spaceName,
      res.spaceMontant,
      res.participants,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mes_reservations.csv";
    a.click();
  };

  const handleExportPDF = () => {
    const element = document.getElementById("reservations-table");
    const opt = {
      margin: 0.3,
      filename: "mes_reservations.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
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
      res.statut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.spaceMontant
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) // pour les montants
  );

  return (
    <MDBContainer fluid className="dashboard-bg px-0">
      {/* Navbar */}
      <div className="dashboard-navbar d-flex align-items-center justify-content-between px-4 py-3 shadow bg-primary">
        <div className="d-flex align-items-center gap-4">
          <img src={logo} alt="Logo" style={{ width: "100px" }} />
          <nav className="dashboard-menu d-none d-md-flex gap-4">
            <Link to="/dashboard">
              <MDBIcon icon="tachometer-alt" className="me-2" /> Tableau de bord
            </Link>
            <Link to="/mes-reservations">
              <MDBIcon icon="clipboard-list" className="me-2" /> Mes
              Réservations
            </Link>
            <Link to="/reserver">
              <MDBIcon icon="calendar-check" className="me-2" /> Réserver
            </Link>
            <Link to="/profil">
              <MDBIcon icon="user-circle" className="me-2" /> Profil
            </Link>
          </nav>
        </div>
        <div className="d-flex align-items-center gap-2">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              userEmail?.split("@")[0] || "Utilisateur"
            )}&background=fff&color=3B71CA&size=40`}
            alt="Avatar"
            className="rounded-circle"
            style={{ width: "40px", height: "40px", border: "2px solid white" }}
          />
          <span className="text-white">
            {userEmail && userEmail.split("@")[0]}
          </span>
          <MDBBtn size="sm" color="white" onClick={signOut}>
            <MDBIcon icon="sign-out-alt" />
          </MDBBtn>
        </div>
      </div>
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
              {showToast.type === "success"
                ? "Réservation supprimée !"
                : "Une erreur est survenue. Veuillez réessayer."}
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
                  <th>Participants</th>
                  <th>Statut</th>
                  <th>Espace</th>
                  <th>Actions</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody className=" text-center">
                {filteredReservations.map((res) => (
                  <tr key={res.id}>
                    <td>
                      <strong>{res.code_reservation}</strong>
                    </td>
                    <td>{new Date(res.date).toLocaleString()}</td>
                    <td>{res.duree} h</td>
                    <td>{res.service}</td>
                    <td>{res.spaceMontant} €</td>
                    <td>{res.participants}</td>
                    <td>{res.statut}</td>
                    <td>
                      {res.spaceName} ({res.spaceLocation})
                    </td>
                    <td>
                      <MDBBtn
                        size="sm"
                        color="warning"
                        onClick={() => handleUpdateReservation(res)}
                      >
                        <MDBIcon fas icon="pen" />
                      </MDBBtn>{" "}
                      <MDBBtn
                        size="sm"
                        color="danger"
                        onClick={() => handleDeleteReservation(res.id)}
                      >
                        <MDBIcon fas icon="trash" />
                      </MDBBtn>
                    </td>
                  </tr>
                ))}
              </MDBTableBody>
            </MDBTable>
          </div>
        )}
      </MDBContainer>

      <footer className="footer text-center p-3 bg-primary text-white mt-auto">
        © 2025 ReserGo. Tous droits réservés.
      </footer>

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
              <MDBBtn color="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </MDBBtn>
              <MDBBtn
                color="danger"
                onClick={() => handleConfirmDelete(reservationToDelete)}
              >
                Supprimer
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </MDBContainer>
  );
}

export default MesReservations;
