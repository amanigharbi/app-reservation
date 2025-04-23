import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MDBIcon } from "mdb-react-ui-kit";
import logo from "../../images/logo-3.png";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
function Navbar() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [reservationsCount, setReservationsCount] = useState(0);
  const [spacesCount, setSpacesCount] = useState(0);
  const [montantTotal, setMontantTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [user, setUser] = useState(null);

  const fetchUserByEmail = async (email) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { uid: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  };
  // useEffect pour écouter l'état de l'utilisateur et les réservations en temps réel depuis Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email);

        try {
          // Essayer de récupérer l'utilisateur depuis Firestore par email
          const userFromDB = await fetchUserByEmail(currentUser.email);

          let userData;
          if (userFromDB) {
            userData = { uid: currentUser.uid, ...userFromDB };
          } else {
            console.warn("Utilisateur introuvable dans Firestore");
            userData = {
              uid: currentUser.uid,
              email: currentUser.email,
              firstName: currentUser.displayName?.split(" ")[0] || "",
              lastName: currentUser.displayName?.split(" ")[1] || "",
              username:
                currentUser.displayName || currentUser.email.split("@")[0],
            };
          }

          setUser(userData);
          setEditData(userData);

          // 🔄 Écouter les réservations en temps réel
          const q = query(
            collection(db, "reservations"),
            where("utilisateurId", "==", currentUser.uid)
          );

          const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
            const reservationList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            const sortedReservations = reservationList
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 3);

            setReservations(sortedReservations);
          });

          // 💾 Nettoyage des listeners
          return () => {
            unsubscribeFirestore();
          };
        } catch (error) {
          console.error(
            "Erreur lors de la récupération de l'utilisateur:",
            error
          );
        } finally {
          setLoading(false);
        }
      } else {
        setUserEmail(null);
        navigate("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // Récupération globale des compteurs (1 seule fois)
  useEffect(() => {
    const fetchData = async () => {
      const reservationsSnapshot = await getDocs(
        collection(db, "reservations")
      );
      setReservationsCount(reservationsSnapshot.size);

      const spacesSnapshot = await getDocs(collection(db, "spaces"));
      setSpacesCount(spacesSnapshot.size);

      const total = reservationsSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        return acc + (parseFloat(data.montant) || 0);
      }, 0);
      setMontantTotal(total);
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      sessionStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <div className="dashboard-navbar d-flex align-items-center justify-content-between px-4 py-3 shadow bg-primary">
      <div className="d-flex align-items-center gap-4">
        <img
          src={logo}
          alt="Logo"
          style={{ width: "100px", backgroundColor: "transparent" }}
        />
        <nav className="dashboard-menu d-none d-md-flex gap-4">
          <Link to="/dashboard">
            <MDBIcon icon="tachometer-alt" className="me-2" /> Tableau de bord
          </Link>
          <Link to="/mes-reservations">
            <MDBIcon icon="clipboard-list" className="me-2" /> Mes Réservations
          </Link>
          <Link to="/reserver">
            <MDBIcon icon="calendar-check" className="me-2" /> Réserver
          </Link>
          <Link to="/profil">
            <MDBIcon icon="user-circle" className="me-2" /> Profil
          </Link>
        </nav>
      </div>
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <img
            src={
              user?.photoURL ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.username || user?.email?.split("@")[0] || "Utilisateur"
              )}&background=fff&color=3B71CA&size=40`
            }
            alt="Avatar"
            className="rounded-circle shadow-sm"
            style={{ width: "40px", height: "40px", border: "2px solid white" }}
          />
          <Link to="/profil">
            <span className="text-white">
              {user?.username || user?.email?.split("@")[0] || "Utilisateur"}
            </span>
          </Link>
          <button
            className="btn btn-white btn-sm"
            onClick={handleLogout}
            style={{ padding: "0.25rem 0.5rem" }}
          >
            <MDBIcon icon="sign-out-alt" className="me-0" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
