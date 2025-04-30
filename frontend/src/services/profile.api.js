import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/protected";

export const fetchProfileAdmin = async (token) => {
  const response = await axios.get(`${API_URL}/api/protected/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const fetchProfile = async (token) => {
  return await axios.get(`${API_URL}/api/protected/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateProfile = async (token, profileData) => {
  return await axios.put(`${API_URL}/api/protected/profile`, profileData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const uploadProfileImage = async (token, file) => {
  const formData = new FormData();
  formData.append("image", file);

  return await axios.post(`${API_URL}/api/protected/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
