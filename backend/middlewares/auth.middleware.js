const { admin } = require("../config/firebase.config");

exports.authenticate = async (req, res, next) => {
  // Récupérer le token depuis l'en-tête Authorization
  const token = req.headers.authorization?.split(" ")[1];

  // Vérifier si le token est présent
  if (!token) {
    return res.status(401).json({ error: "Accès refusé. Token manquant." });
  }

  try {
    // Vérification du token Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Stocker les informations utilisateur dans la requête (req.user)
    req.user = decodedToken;

    // Passer à la prochaine étape (route suivante)
    next();
  } catch (error) {
    // Gestion des erreurs avec des messages plus détaillés
    console.error("Erreur de vérification du token:", error);
    return res.status(401).json({ error: "Token invalide ou expiré." });
  }
};
