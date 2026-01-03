// Authentication Service
import apiClient from "./api";

export const authService = {
  // Register new tenant
  register: async (data) => {
    const response = await apiClient.post("/auth/register", data);
    // Check if registration was successful
    if (!response.data.success) {
      const error = new Error(response.data.message || "Registration failed");
      error.response = { data: response.data };
      throw error;
    }
    if (response.data.success && response.data.data.token) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (email, password, tenantSubdomain) => {
    const response = await apiClient.post("/auth/login", {
      email,
      password,
      tenantSubdomain,
    });
    // Check if login was successful
    if (!response.data.success) {
      const error = new Error(response.data.message || "Login failed");
      error.response = { data: response.data };
      throw error;
    }
    if (response.data.success && response.data.data.token) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get current user from storage
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};
