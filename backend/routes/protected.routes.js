// routes/protected.routes.js
const express = require("express");
const cors = require("cors"); // Importation de CORS
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { db } = require("../config/firebase.config");
const app = express();

// Autoriser les requêtes provenant de localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend
    credentials: true, // Permet l'envoi des cookies
  })
);
router.get("/dashboard", authenticate, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userEmail = req.user.email; // L'email de l'utilisateur authentifié

    // Récupérer les données utilisateur à partir de la collection 'users' en utilisant l'email
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", userEmail) // Rechercher par email
      .get();

    // Vérifier si un utilisateur a été trouvé
    if (userSnapshot.empty) {
      return res
        .status(404)
        .json({ error: "Utilisateur non trouvé dans la base de données." });
    }

    // Récupérer les données de l'utilisateur
    const userData = userSnapshot.docs[0].data(); // Supposons qu'il y a un seul utilisateur correspondant à l'email

    // Récupérer les réservations de l'utilisateur
    const reservationsSnapshot = await db
      .collection("reservations")
      .where("utilisateurId", "==", userId)
      .get();

    const allReservations = reservationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Trier les réservations par date et récupérer les 3 plus récentes
    const recentReservations = allReservations
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    // Calculer le montant total des réservations
    const totalAmount = allReservations.reduce(
      (acc, res) => acc + (parseFloat(res.montant) || 0),
      0
    );

    // Récupérer le nombre d'espaces disponibles
    const spacesCountSnapshot = await db.collection("spaces").get();

    res.json({
      user: {
        ...userData, // Ajouter les informations utilisateur récupérées
        email: userEmail, // Inclure l'email dans la réponse
      },
      reservationsCount: allReservations.length, // Nombre total de réservations
      spacesCount: spacesCountSnapshot.size, // Nombre d'espaces disponibles
      totalAmount, // Montant total des réservations
      recentReservations, // 3 réservations les plus récentes
    });
  } catch (error) {
    console.error("Erreur dashboard backend:", error);
    res.status(500).json({ error: "Erreur lors du chargement des données" });
  }
});

// Exemple d'API pour récupérer les données utilisateur à partir de la base de données
router.get("/navbar", authenticate, async (req, res) => {
  try {
    const userEmail = req.user.email; // L'email de l'utilisateur authentifié
    // Récupérer les données utilisateur de la collection 'users' via l'email
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", userEmail) // Recherche par email
      .get();

    // Vérifier si un utilisateur a été trouvé
    if (userSnapshot.empty) {
      return res
        .status(404)
        .json({ error: "Utilisateur non trouvé dans la base de données." });
    }

    const user = userSnapshot.docs[0].data(); // Récupérer les données de l'utilisateur

    res.json({ user }); // Retourner les informations utilisateur (nom, photo, etc.)
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données utilisateur:",
      error
    );
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Route pour obtenir les informations de l'utilisateur par token
router.get("/profile", authenticate, async (req, res) => {
  try {
    const userEmail = req.user.email; // Récupérer l'email de l'utilisateur à partir du token

    const userSnapshot = await db
      .collection("users")
      .where("email", "==", userEmail) // Recherche par email
      .get();

    // Vérifier si un utilisateur a été trouvé
    if (userSnapshot.empty) {
      return res
        .status(404)
        .json({ error: "Utilisateur non trouvé dans la base de données." });
    }

    const user = userSnapshot.docs[0].data(); // Récupérer les données de l'utilisateur
    console.log(user); // Afficher les données utilisateur dans la console
    res.json({ user }); // Retourner les informations utilisateur (nom, photo, etc.)
  } catch (error) {
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// Route pour mettre à jour les informations du profil
router.put("/profile", authenticate, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const updateData = req.body;

    // Récupérer l'utilisateur par email
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", userEmail)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const userDoc = userSnapshot.docs[0];
    await db.collection("users").doc(userDoc.id).update(updateData);

    const updatedUser = (await userDoc.ref.get()).data();

    res.json(updatedUser); // Renvoie les nouvelles données
  } catch (error) {
    console.error("Erreur backend:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du profil" });
  }
});
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // <== Dossier local 'uploads' !
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Exemple: 1713982340021.jpg
  },
});

const upload = multer({ storage });

router.post("/upload", authenticate, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier envoyé." });
  }

  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// partie pour la gestion des réservations

// Récupérer toutes les réservations de l'utilisateur connecté
router.get("/reservations", authenticate, async (req, res) => {
  try {
    const userId = req.user.uid;

    const reservationsSnapshot = await db
      .collection("reservations")
      .where("utilisateurId", "==", userId)
      .get();

    const reservations = reservationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ reservations });
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors du chargement des réservations." });
  }
});

// Obtenir une seule réservation par son ID
router.get("/reservations/:id", authenticate, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.uid;

    const reservationRef = db.collection("reservations").doc(reservationId);
    const reservationSnap = await reservationRef.get();

    if (!reservationSnap.exists) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    const reservationData = reservationSnap.data();

    if (reservationData.utilisateurId !== userId) {
      return res
        .status(403)
        .json({ message: "Accès non autorisé à cette réservation." });
    }

    res.json(reservationData);
  } catch (error) {
    console.error("Erreur récupération réservation:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération." });
  }
});

// Supprimer une réservation spécifique
router.delete("/reservations/:id", authenticate, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.uid;

    const reservationRef = db.collection("reservations").doc(reservationId);
    const reservationSnapshot = await reservationRef.get();

    if (!reservationSnapshot.exists) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    const reservationData = reservationSnapshot.data();

    // Vérifie que la réservation appartient bien à l'utilisateur connecté
    if (reservationData.utilisateurId !== userId) {
      return res
        .status(403)
        .json({ message: "Non autorisé à supprimer cette réservation." });
    }

    await reservationRef.delete();
    res.json({ message: "Réservation supprimée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de la réservation :", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression." });
  }
});

// Mettre à jour une réservation spécifique
router.put("/reservations/:id", authenticate, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.uid;

    const {
      date,
      numGuests,
      status,
      heure_arrivee,
      heure_depart,
      duree,
      spaceMontant,
      montant,
      rappels,
      modifications,
      paiements,
      remboursements,
      annulations,
    } = req.body;

    if (!date || !numGuests || !status) {
      return res.status(400).json({ message: "Informations incomplètes." });
    }

    const reservationRef = db.collection("reservations").doc(reservationId);
    const reservationSnapshot = await reservationRef.get();

    if (!reservationSnapshot.exists) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    const reservationData = reservationSnapshot.data();

    if (reservationData.utilisateurId !== userId) {
      return res
        .status(403)
        .json({ message: "Non autorisé à modifier cette réservation." });
    }

    await reservationRef.update({
      date,
      numGuests,
      status,
      heure_arrivee,
      heure_depart,
      duree,
      spaceMontant,
      montant,
      rappels,
      modifications,
      paiements,
      remboursements,
      annulations,
      updatedAt: new Date(),
    });

    res.json({ message: "Réservation mise à jour avec succès." });
  } catch (error) {
    console.error("Erreur maj réservation:", error);
    res.status(500).json({ message: "Erreur serveur mise à jour." });
  }
});

module.exports = router;
