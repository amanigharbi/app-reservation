const { admin } = require("../config/firebase.config");

// Créer un token JWT personnalisé (optionnel)
exports.createCustomToken = async (req, res) => {
  const { uid } = req.body; // uid de Firebase Auth

  try {
    const token = await admin.auth().createCustomToken(uid);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création du token" });
  }
};

// Vérifier un token Firebase (pour les routes protégées)
exports.verifyToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.json({ uid: decodedToken.uid, email: decodedToken.email });
  } catch (error) {
    res.status(401).json({ error: "Token invalide" });
  }
};
