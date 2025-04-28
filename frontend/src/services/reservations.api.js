import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/protected";

export const fetchReservations = async (token) => {
  return await axios.get(`${API_URL}/api/protected/reservations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteReservation = async (token, id) => {
  return await axios.delete(`${API_URL}/api/protected/reservations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateReservation = async (token, id, data) => {
  return await axios.put(`${API_URL}/api/protected/reservations/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
