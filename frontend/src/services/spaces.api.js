import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/protected";

export const fetchSpaces = async () => {
  return await axios.get(`${API_URL}/api/protected/spaces`);
};

export const fetchSpacesById = async (token, id) => {
  const response = await axios.get(`${API_URL}/api/protected/spaces/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createSpace = async (spaceData) => {
  return await axios.post(`${API_URL}/api/protected/space`, spaceData);
};

export const updateSpace = async (id, spaceData) => {
  return await axios.put(`${API_URL}/api/protected/space/${id}`, spaceData);
};

export const deleteSpace = async (id) => {
  return await axios.delete(`${API_URL}/api/protected/space/${id}`);
};
