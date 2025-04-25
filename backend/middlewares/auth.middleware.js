const { admin } = require("../config/firebase.config");

exports.authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Accès refusé" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Stocke les infos utilisateur dans la requête
    next();
  } catch (error) {
    res.status(401).json({ error: "Token invalide" });
  }
};