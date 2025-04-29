// routes/protected.routes.js
const express = require("express");
const cors = require("cors");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { db } = require("../config/firebase.config");
const app = express();

// Autoriser les requêtes provenant de localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
router.get("/dashboard", authenticate, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userEmail = req.user.email;

    // Récupérer les données utilisateur à partir de la collection 'users' en utilisant l'email
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", userEmail)
      .get();

    // Vérifier si un utilisateur a été trouvé
    if (userSnapshot.empty) {
      return res
        .status(404)
        .json({ error: "Utilisateur non trouvé dans la base de données." });
    }

    // Récupérer les données de l'utilisateur
    const userData = userSnapshot.docs[0].data();

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
        ...userData,
        email: userEmail,
      },
      reservationsCount: allReservations.length,
      spacesCount: spacesCountSnapshot.size,
      totalAmount,
      recentReservations,
    });
  } catch (error) {
    console.error("Erreur dashboard backend:", error);
    res.status(500).json({ error: "Erreur lors du chargement des données" });
  }
});

// Exemple d'API pour récupérer les données utilisateur à partir de la base de données
router.get("/navbar", authenticate, async (req, res) => {
  try {
    const userEmail = req.user.email;
    // Récupérer les données utilisateur de la collection 'users' via l'email
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", userEmail)
      .get();

    // Vérifier si un utilisateur a été trouvé
    if (userSnapshot.empty) {
      return res
        .status(404)
        .json({ error: "Utilisateur non trouvé dans la base de données." });
    }

    const user = userSnapshot.docs[0].data();

    res.json({ user });
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

    res.json(updatedUser);
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
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
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

// Route pour créer une nouvelle réservation
router.post("/reservations", authenticate, async (req, res) => {
  try {
    // 1. Validation des données
    const requiredFields = [
      "code_reservation",
      "spaceId",
      "date",
      "participants",
      "status",
      "heure_arrivee",
      "heure_depart",
      "duree",
      "montant",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Champs manquants: ${missingFields.join(", ")}`,
        code: "MISSING_FIELDS",
      });
    }

    // 2. Vérification de la cohérence des heures
    const { heure_arrivee, heure_depart, duree } = req.body;

    if (
      new Date(`1970-01-01T${heure_depart}`) <=
      new Date(`1970-01-01T${heure_arrivee}`)
    ) {
      return res.status(400).json({
        message: "L'heure de départ doit être après l'heure d'arrivée",
        code: "INVALID_TIME_RANGE",
      });
    }

    // 3. Vérification du montant
    if (isNaN(parseFloat(req.body.montant))) {
      return res.status(400).json({
        message: "Le montant doit être un nombre valide",
        code: "INVALID_AMOUNT",
      });
    }

    // 4. Vérification de la disponibilité de l'espace
    const spaceRef = db.collection("spaces").doc(req.body.spaceId);
    const spaceDoc = await spaceRef.get();

    if (!spaceDoc.exists) {
      return res.status(404).json({
        message: "Espace non trouvé",
        code: "SPACE_NOT_FOUND",
      });
    }

    // 5. Vérification des conflits de réservation
    const reservationsSnapshot = await db
      .collection("reservations")
      .where("spaceId", "==", req.body.spaceId)
      .where("date", "==", req.body.date)
      .get();

    const hasConflict = reservationsSnapshot.docs.some((doc) => {
      const reservation = doc.data();
      return (
        (heure_arrivee >= reservation.heure_arrivee &&
          heure_arrivee < reservation.heure_depart) ||
        (heure_depart > reservation.heure_arrivee &&
          heure_depart <= reservation.heure_depart) ||
        (heure_arrivee <= reservation.heure_arrivee &&
          heure_depart >= reservation.heure_depart)
      );
    });

    if (hasConflict) {
      return res.status(409).json({
        message:
          "Conflit de réservation - L'espace est déjà réservé pour cette plage horaire",
        code: "RESERVATION_CONFLICT",
      });
    }

    // 6. Création de la réservation
    const newReservation = {
      utilisateurId: req.user.uid,
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 7. Transaction pour garantir l'intégrité des données
    const reservationRef = await db.runTransaction(async (transaction) => {
      const reservationRef = db.collection("reservations").doc();
      await transaction.set(reservationRef, newReservation);
      return reservationRef;
    });

    // 8. Réponse avec données enrichies
    res.status(201).json({
      success: true,
      reservationId: reservationRef.id,
      reservation: {
        ...newReservation,
        id: reservationRef.id,
        spaceName: spaceDoc.data().name,
        spaceLocation: spaceDoc.data().location,
      },
      links: {
        view: `/reservations/${reservationRef.id}`,
        cancel: `/reservations/${reservationRef.id}/cancel`,
      },
    });
  } catch (error) {
    console.error("Erreur création réservation:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
      user: req.user.uid,
    });

    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la réservation",
      code: "SERVER_ERROR",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Backend (exemple en Express.js)
router.get("/spaces", async (req, res) => {
  // Récupération des espaces disponibles dans la base de données
  try {
    const spacesSnapshot = await db.collection("spaces").get();
    const spaces = spacesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ spaces });
  } catch (error) {
    console.error("Erreur lors de la récupération des espaces :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors du chargement des espaces." });
  }
});
// Récupérer les détails d'un espace spécifique
router.get("/spaces/:id", authenticate, async (req, res) => {
  try {
    const spaceId = req.params.id;
    const spaceRef = db.collection("spaces").where("id", "==", spaceId);
    const spaceSnap = await spaceRef.get();
    if (!spaceSnap.exists) {
      return res.status(404).json({ message: "Espace introuvable." });
    }
    const spaceData = spaceSnap.data();

    res.json({
      ...spaceData,
      id: spaceId,
    });
  } catch (error) {
    console.error("Erreur récupération d'espace:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération." });
  }
});

// admin

router.get("/dashboard-admin", authenticate, async (req, res) => {
  try {
    const usersSnapshot = await db
      .collection("users")
      .where("role", "==", "user")
      .get();

    const usersCount = usersSnapshot.size;
    // Récupérer les réservations
    const reservationsSnapshot = await db.collection("reservations").get();
    if (!reservationsSnapshot) {
      throw new Error("Aucune réservation trouvée.");
    }
    const allReservations = reservationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculer les autres informations
    const totalAmount = allReservations.reduce(
      (acc, res) => acc + (parseFloat(res.montant) || 0),
      0
    );
    // Générer les statistiques par mois
    const revenuePerMonth = {}; // { "2024-01": 500, "2024-02": 600, ... }
    const reservationsPerMonth = {}; // { "2024-01": 10, "2024-02": 12, ... }

    allReservations.forEach((res) => {
      const date = new Date(res.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`; // ex: 2024-01
      if (!revenuePerMonth[monthKey]) {
        revenuePerMonth[monthKey] = 0;
      }
      if (!reservationsPerMonth[monthKey]) {
        reservationsPerMonth[monthKey] = 0;
      }

      revenuePerMonth[monthKey] += parseFloat(res.montant) || 0;
      reservationsPerMonth[monthKey] += 1;
    });

    const spacesCountSnapshot = await db.collection("spaces").get();
    const allSpaces = spacesCountSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json({
      recentSpace: allSpaces.slice(0, 3),
      reservationsCount: allReservations.length,
      spacesCount: spacesCountSnapshot.size,
      totalAmount,
      recentReservations: allReservations.slice(0, 3),
      usersCount,
      revenuePerMonth, // Ajouté ✅
      reservationsPerMonth,
    });
  } catch (error) {
    console.error("Erreur lors du traitement des données:", error);
    res.status(500).json({ error: "Erreur lors du chargement des données" });
  }
});
router.get("/reservations-admin", authenticate, async (req, res) => {
  try {
    const reservationsSnapshot = await db.collection("reservations").get();

    const reservations = await Promise.all(
      reservationsSnapshot.docs.map(async (doc) => {
        const reservationData = doc.data();
        const utilisateurId = reservationData.utilisateurId;

        let utilisateurData = null;

        if (utilisateurId) {
          const userDoc = await db.collection("users").doc(utilisateurId).get();
          if (userDoc.exists) {
            utilisateurData = userDoc.data();
          }
        }

        return {
          id: doc.id,
          ...reservationData,
          utilisateur: utilisateurData, // Inclut les données utilisateur ici
        };
      })
    );

    res.json({ reservations });
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations :", error);
    res.status(500).json({
      message: "Erreur serveur lors du chargement des réservations.",
    });
  }
});

router.get("/reservations-admin/:id", authenticate, async (req, res) => {
  try {
    const reservationId = req.params.id;

    const reservationRef = db.collection("reservations").doc(reservationId);
    const reservationSnap = await reservationRef.get();

    if (!reservationSnap.exists) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    const reservationData = reservationSnap.data();
    res.json(reservationData);
  } catch (error) {
    console.error("Erreur récupération réservation:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération." });
  }
});

module.exports = router;
