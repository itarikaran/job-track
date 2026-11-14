import api from "./api";

export const authService = {
  // Register user
  async register(userData) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Login user
  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Logout user
  async logout() {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Get current user
  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Update profile
  async updateProfile(profileData) {
    const response = await api.put("/auth/profile", profileData);
    return response.data;
  },
};