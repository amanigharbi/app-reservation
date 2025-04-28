import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/protected";

export const fetchDashboard = async (token) => {
  const response = await axios.get(`${API_URL}/api/protected/dashboard-admin`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
