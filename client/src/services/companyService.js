import api from "./api";

export const companyService = {
  // Get all companies with filters
  async getCompanies(params = {}) {
    const response = await api.get("/companies", { params });
    return response.data;
  },

  // Get single company by ID
  async getCompany(id) {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  // Create company
  async createCompany(companyData) {
    const response = await api.post("/companies", companyData);
    return response.data;
  },

  // Update company
  async updateCompany(id, companyData) {
    const response = await api.put(`/companies/${id}`, companyData);
    return response.data;
  },

  // Delete company
  async deleteCompany(id) {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },
};