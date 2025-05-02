import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/protected";

export const fetchSpaces = async (token) => {
  const response = await axios.get(`${API_URL}/api/protected/spaces`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const fetchSpacesById = async (token, id) => {
  console.log("idd",id)
  const response = await axios.get(`${API_URL}/api/protected/spaces/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("response ",response.data)

  return response.data;
};
export const createSpace = async (token, newSpace) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/protected/space`,
      newSpace,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la requête API:", error.response.data);
    throw error;
  }
};

export const updateSpace = async (token, id, spaceData) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/protected/space/${id}`,
      spaceData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la requête API:", error.response.data);
    throw error;
  }
};

export const deleteSpace = async (token, id) => {
  return await axios.delete(`${API_URL}/api/protected/space/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
