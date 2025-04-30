import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/protected";

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

export const fetchProfileUsers = async (token) => {
  return await axios.get(`${API_URL}/api/protected/profile-users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const fetchProfileUser = async (token, userId) => {
  return await axios.get(`${API_URL}/api/protected/profile/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const updateRole = async (token, id, data) => {
  return await axios.put(`${API_URL}/api/protected/profile/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};



export const deleteUser = async (token, userId) => {
  return await axios.delete(`${API_URL}/api/protected/profile/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

