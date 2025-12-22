// Task Service
import apiClient from "./api";

export const taskService = {
  // Create new task
  create: async (data) => {
    const response = await apiClient.post("/tasks", data);
    return response.data;
  },

  // Get tasks by project
  getByProject: async (projectId, page = 1, limit = 20, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get(`/tasks/project/${projectId}`, {
      params,
    });
    return response.data;
  },

  // Get task by ID
  getById: async (id) => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },

  // Update task
  update: async (id, data) => {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return response.data;
  },

  // Update task status
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  // Delete task
  delete: async (id) => {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },
};
