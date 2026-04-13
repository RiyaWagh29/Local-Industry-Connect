import axios from "axios";

const api = axios.create({
  baseURL: "https://local-industry-connect.onrender.com/api",
});

// 🔥 Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔥 Handle errors globally (NO CRASH)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - token missing/expired");
    }
    return Promise.reject(error);
  }
);

export default api;