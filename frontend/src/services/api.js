// API Configuration and Axios Instance
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://multi-tenant-saas-platform-with-project.onrender.com/api");

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log("🔵 API Request:", {
      method: config.method.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      data: config.data,
    });

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("🔴 Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log("🟢 API Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("🔴 API Error:", {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
