import axios from "axios";

const configuredApiOrigin = import.meta.env.VITE_API_URL;
const apiOrigin = (
  configuredApiOrigin ||
  (import.meta.env.PROD ? "https://job-track-z7e5.onrender.com" : "")
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: apiOrigin ? `${apiOrigin}/api` : "/api",
  withCredentials: true, // Required for HttpOnly cookie authentication
});

// Response interceptor: handle 401 (unauthorized) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isSessionCheck = error.config?.url?.replace(/\/+$/, "") === "/auth/me";
    if (error.response && error.response.status === 401 && !isSessionCheck) {
      // Dispatch a custom event so AuthContext can listen and logout
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;