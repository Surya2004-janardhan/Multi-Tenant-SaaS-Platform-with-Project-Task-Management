// User Service
import apiClient from "./api";

export const userService = {
  // Create new user
  create: async (data) => {
    const response = await apiClient.post("/users", data);
    return response.data;
  },

  // Get all users in tenant
  getAll: async (page = 1, limit = 10, search = null, role = null) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (role) params.role = role;
    const response = await apiClient.get("/users", { params });
    return response.data;
  },

  // Update user
  update: async (id, data) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  delete: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};
