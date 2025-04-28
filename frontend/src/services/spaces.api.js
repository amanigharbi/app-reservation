import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/protected";

export const fetchSpaces = async () => {
  return await axios.get(`${API_URL}/api/protected/spaces`);
};

export const createSpace = async (spaceData) => {
  return await axios.post(`${API_URL}/api/protected/spaces`, spaceData);
};

export const updateSpace = async (id, spaceData) => {
  return await axios.put(`${API_URL}/api/protected/spaces/${id}`, spaceData);
};

export const deleteSpace = async (id) => {
  return await axios.delete(`${API_URL}/api/protected/spaces/${id}`);
};
