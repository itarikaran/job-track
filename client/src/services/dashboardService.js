import api from "./api";

export const dashboardService = {
  async getStats() {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },
  async getRecent() {
    const response = await api.get("/dashboard/recent");
    return response.data;
  },
  async getUpcoming() {
    const response = await api.get("/dashboard/upcoming");
    return response.data;
  },
  async getCharts() {
    const response = await api.get("/dashboard/charts");
    return response.data;
  },
};
