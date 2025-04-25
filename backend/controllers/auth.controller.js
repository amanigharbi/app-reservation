const { admin } = require("../config/firebase.config");

// Créer un token JWT personnalisé (optionnel)
exports.createCustomToken = async (req, res) => {
  const { uid } = req.body; // uid de Firebase Auth

  // Vérifier si l'uid est fourni
  if (!uid) {
    return res.status(400).json({ error: "L'UID est requis pour créer un token personnalisé." });
  }

  try {
    // Créer un token personnalisé via Firebase Admin SDK
    const token = await admin.auth().createCustomToken(uid);
    res.status(200).json({ token });
  } catch (error) {
    // Envoi d'un message d'erreur avec un statut 500 en cas d'échec
    console.error("Erreur lors de la création du token", error);
    res.status(500).json({ error: "Erreur lors de la création du token" });
  }
};

// Vérifier un token Firebase (pour les routes protégées)
exports.verifyToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Token envoyé dans l'en-tête Authorization

  // Vérifier si le token est présent
  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    // Vérification du token via Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Retourner l'UID et l'email de l'utilisateur décodé à partir du token
    res.status(200).json({ uid: decodedToken.uid, email: decodedToken.email });
  } catch (error) {
    // Envoi d'un message d'erreur si le token est invalide
    console.error("Erreur lors de la vérification du token", error);
    res.status(401).json({ error: "Token invalide" });
  }
};
