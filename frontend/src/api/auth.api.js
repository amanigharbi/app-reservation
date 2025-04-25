import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Vérifier un token Firebase côté backend
export const verifyToken = async (token) => {
  const response = await axios.get(`${API_URL}/api/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// (Optionnel) Créer un token personnalisé
export const createCustomToken = async (uid) => {
  const response = await axios.post(`${API_URL}/api/auth/custom-token`, { uid });
  return response.data.token;
};