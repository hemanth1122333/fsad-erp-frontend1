import axios from "axios";

const isLocalHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "::1";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalHost
    ? "http://localhost:8080/api"
    : "https://fsad-erp-backend-2.onrender.com/api");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;