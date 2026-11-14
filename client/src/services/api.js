import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Required for HttpOnly cookie authentication
});

// Response interceptor: handle 401 (unauthorized) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Dispatch a custom event so AuthContext can listen and logout
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;