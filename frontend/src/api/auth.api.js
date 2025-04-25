import axios from "axios";

// Vérification de l'URL API dans les variables d'environnement
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; // Valeur par défaut pour le développement
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
})
// Vérifier un token Firebase côté backend
export const verifyToken = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000 // 5 secondes max

    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la vérification du token :", error);
    throw new Error(error.response?.data?.error || "Erreur de connexion au serveur");
  }
};

// (Optionnel) Créer un token personnalisé
export const createCustomToken = async (uid) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/custom-token`, { uid });
    return response.data.token;
  } catch (error) {
    console.error("Erreur lors de la création du token personnalisé :", error);
    throw new Error(error.response?.data?.error || "Erreur de connexion au serveur");
  }
};
