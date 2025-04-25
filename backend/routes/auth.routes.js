const express = require("express");
const router = express.Router();
const { createCustomToken, verifyToken } = require("../controllers/auth.controller");

// Route pour générer un token personnalisé (si nécessaire)
router.post("/custom-token", async (req, res) => {
  try {
    await createCustomToken(req, res); // Appeler la fonction de création du token
  } catch (error) {
    res.status(500).json({ error: "Erreur interne lors de la génération du token" });
  }
});

// Route pour vérifier un token Firebase
router.get("/verify", async (req, res) => {
  try {
    await verifyToken(req, res); // Appeler la fonction de vérification du token
  } catch (error) {
    res.status(500).json({ error: "Erreur interne lors de la vérification du token" });
  }
});

module.exports = router;
