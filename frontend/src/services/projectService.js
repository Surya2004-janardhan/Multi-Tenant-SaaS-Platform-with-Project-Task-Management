// Project Service
import apiClient from "./api";

export const projectService = {
  // Create new project
  create: async (data) => {
    const response = await apiClient.post("/projects", data);
    return response.data;
  },

  // Get all projects
  getAll: async (page = 1, limit = 10, status = null) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await apiClient.get("/projects", { params });
    return response.data;
  },

  // Get project by ID
  getById: async (id) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  // Update project
  update: async (id, data) => {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  },

  // Delete project
  delete: async (id) => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },
};
