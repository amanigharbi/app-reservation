import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn,
  MDBIcon,
  MDBCarousel,
  MDBCarouselItem,
  MDBCarouselCaption,
  MDBModal,
  MDBModalDialog,
  MDBModalHeader,
  MDBModalBody,
  MDBModalFooter,
} from "mdb-react-ui-kit";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import "../styles/Pages.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
function Dashboard() {
  const [userEmail, setUserEmail] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [reservationsCount, setReservationsCount] = useState(0);
  const [spacesCount, setSpacesCount] = useState(0);
  const [montantTotal, setMontantTotal] = useState(0);
  const [user, setUser] = useState(null);

  // useEffect pour écouter l'état de l'utilisateur et les réservations en temps réel depuis Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email);
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            ...userDoc.data(),
          });
        } else {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            firstName: currentUser.displayName?.split(" ")[0] || "",
            lastName: currentUser.displayName?.split(" ")[1] || "",
            username:
              currentUser.displayName || currentUser.email.split("@")[0],
          });
        }
        // Récupérer les réservations pour l'utilisateur actuel depuis Firestore
        const q = query(
          collection(db, "reservations"),
          where("utilisateurId", "==", currentUser.uid)
        );

        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          const reservationList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Trier les réservations par date et garder seulement les 3 dernières
          const sortedReservations = reservationList
            .sort((a, b) => {
              return new Date(b.date) - new Date(a.date);
            })
            .slice(0, 3); // Prendre seulement les 3 dernières

          setReservations(sortedReservations);
        });

        return () => unsubscribeFirestore(); // Unsubscribe de Firestore lorsque le composant est démonté
      } else {
        setUserEmail(null);
        navigate("/login");
      }
    });

    return () => unsubscribeAuth(); // Unsubscribe de Firebase Auth lorsque le composant est démonté
  }, [navigate]);
  useEffect(() => {
    const fetchData = async () => {
      // Compter les réservations
      const reservationsSnapshot = await getDocs(
        collection(db, "reservations")
      );
      setReservationsCount(reservationsSnapshot.size);

      // Compter les espaces
      const spacesSnapshot = await getDocs(collection(db, "spaces"));
      setSpacesCount(spacesSnapshot.size);

      // 💰 Calculer le total des montants payés
      const total = reservationsSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        return acc + (parseFloat(data.montant) || 0);
      }, 0);
      setMontantTotal(total);
    };

    fetchData();
  }, []);
  
  // Ouvrir le modal avec les détails de la réservation
  const handleShowDetails = (reservation) => {
    setSelectedReservation(reservation);
    setModalOpen(true);
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedReservation(null); // Optionnel: Réinitialiser la réservation sélectionnée
  };

  return (
    <MDBContainer fluid className="dashboard-bg px-0">
      {/* Navbar */}
      <Navbar />

      {/* Carousel */}
      <MDBCarousel showIndicators showControls fade className="carousel-top">
        <MDBCarouselItem itemId={1}>
          <img
            src="https://steelcase-res.cloudinary.com/image/upload/c_fill,q_auto,f_auto,h_656,w_1166/v1479916380/www.steelcase.com/2016/11/23/16-0016132.jpg"
            className="d-block w-100 carousel-image"
            alt="Espace de travail"
          />
          <MDBCarouselCaption>
            <h5>Premier Slide</h5>
            <p>Explorez notre espace de travail moderne et collaboratif.</p>
          </MDBCarouselCaption>
        </MDBCarouselItem>
        {/* Autres éléments du carousel */}
      </MDBCarousel>

      <div className="main-content">
        <MDBContainer className="py-5 px-4">
          <h3 className="text-primary fw-bold mb-4">Tableau de bord</h3>
          <MDBRow>
            <MDBCol md="4">
              <MDBCard className="text-center shadow-sm bg-info text-white rounded-lg hover-effect">
                <MDBCardBody>
                  <MDBCardTitle>
                    <MDBIcon fas icon="clipboard-list" /> Nombre de Réservations
                  </MDBCardTitle>
                  <MDBCardText>{reservationsCount}</MDBCardText>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            <MDBCol md="4">
              <MDBCard className="text-center shadow-sm bg-success text-white rounded-lg hover-effect">
                <MDBCardBody>
                  <MDBCardTitle>
                    <MDBIcon fas icon="cogs" /> Nombre d'Espaces
                  </MDBCardTitle>
                  <MDBCardText>{spacesCount}</MDBCardText>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            <MDBCol md="4">
              <MDBCard className="text-center shadow-sm bg-warning text-white rounded-lg hover-effect">
                <MDBCardBody>
                  <MDBCardTitle>
                    <MDBIcon fas icon="euro-sign" /> Montant Total Payé
                  </MDBCardTitle>
                  <MDBCardText>{montantTotal.toFixed(2)} €</MDBCardText>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
          <br></br>
          <h3
            className="text-primary fw-bold mb-4"
            style={{ fontWeight: "bold" }}
          >
            Réservations récentes
          </h3>

          {/* Tableau des réservations */}
          <MDBRow>
            {reservations.length === 0 ? (
              <MDBCol
                md="12"
                className="d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: "400px" }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                  alt="Aucune réservation"
                  style={{ width: "180px", marginBottom: "20px", opacity: 0.7 }}
                />
                <h5 className="text-muted text-center">
                  Aucune réservation trouvée
                </h5>
                <p className="text-muted text-center">
                  Vous n'avez pas encore effectué de réservation.
                </p>
                <Link to="/reserver">
                  <MDBBtn color="primary" style={{ textTransform: "none" }}>
                    Faire une réservation
                  </MDBBtn>
                </Link>
              </MDBCol>
            ) : (
              reservations.map((res) => (
                <MDBCol
                  md="6"
                  lg="4"
                  key={res.id}
                  className="mb-4 justify-center"
                >
                  <MDBCard className="h-100" border="dark" background="white">
                    <MDBCardBody>
                      <MDBCardTitle
                        className="text-center"
                        style={{ color: "black" }}
                      >
                        <b>Réservation N.</b> {res.code_reservation}
                      </MDBCardTitle>
                      <MDBCardText style={{ color: "black" }}>
                        📍 {res.lieu}
                        <br />
                        📅 {res.date}
                      </MDBCardText>

                      <MDBBtn
                        size="lg"
                        color="deep-purple"
                        style={{
                          textTransform: "none",
                          backgroundColor: "#3B71CA",
                          color: "white",
                        }}
                        onClick={() => handleShowDetails(res)}
                      >
                        Voir Détails
                      </MDBBtn>
                    </MDBCardBody>
                  </MDBCard>
                </MDBCol>
              ))
            )}
          </MDBRow>
        </MDBContainer>
      </div>

      {/* Modal pour afficher les détails de la réservation */}
      <MDBModal open={modalOpen} onClose={setModalOpen} tabIndex="-1">
        <MDBModalDialog size="lg" className="modal-content">
          <MDBModalHeader>
            <h5 className="modal-title text-primary">
              Détails de la Réservation
            </h5>
            <MDBBtn
              className="btn-close"
              color="none"
              onClick={handleCloseModal}
            ></MDBBtn>
          </MDBModalHeader>
          <MDBModalBody>
            {selectedReservation && (
              <MDBRow>
                {/* Colonne gauche */}
                <MDBCol md="6">
                  <p>
                    <strong>Service:</strong> {selectedReservation.service}
                  </p>
                  <p>
                    <strong>Lieu:</strong> {selectedReservation.lieu}
                  </p>
                  <p>
                    <strong>Date:</strong> {selectedReservation.date}
                  </p>
                  <p>
                    <strong>Durée:</strong> {selectedReservation.duree}
                  </p>
                  <p>
                    <strong>Statut:</strong> {selectedReservation.statut}
                  </p>
                  <p>
                    <strong>Participants:</strong>{" "}
                    {selectedReservation.participants}
                  </p>
                </MDBCol>

                {/* Colonne droite */}
                <MDBCol md="6">
                  <p>
                    <strong>Commentaires:</strong>{" "}
                    {selectedReservation.commentaires}
                  </p>
                  <p>
                    <strong>Code de Réservation:</strong>{" "}
                    {selectedReservation.code_reservation}
                  </p>
                  <p>
                    <strong>Heure d'arrivée:</strong>{" "}
                    {selectedReservation.heure_arrivee}
                  </p>
                  <p>
                    <strong>Heure de départ:</strong>{" "}
                    {selectedReservation.heure_depart}
                  </p>
                  <p>
                    <strong>Mode de Paiement:</strong>{" "}
                    {selectedReservation.mode_paiement}
                  </p>
                  <p>
                    <strong>Rappels:</strong>{" "}
                    {Array.isArray(selectedReservation.rappels)
                      ? selectedReservation.rappels.join(", ")
                      : "Aucun rappel"}
                  </p>
                </MDBCol>
              </MDBRow>
            )}
          </MDBModalBody>
          <MDBModalFooter>
            <MDBBtn
              color="secondary"
              onClick={handleCloseModal}
              style={{ textTransform: "none" }}
            >
              Fermer
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalDialog>
      </MDBModal>

      {/* Footer */}
      <Footer />
    </MDBContainer>
  );
}

export default Dashboard;
