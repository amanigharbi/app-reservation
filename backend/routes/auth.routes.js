const express = require("express");
const router = express.Router();
const { createCustomToken, verifyToken } = require("../controllers/auth.controller");

// Route pour générer un token personnalisé (si nécessaire)
router.post("/custom-token", createCustomToken);

// Route pour vérifier un token Firebase
router.get("/verify", verifyToken);

module.exports = router;