// Login Page Component
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SUPER_ADMIN_EMAIL = "superadmin@system.com";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    tenantSubdomain: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if entered email is super admin
  const isSuperAdmin = formData.email === SUPER_ADMIN_EMAIL;

  // Validate form before submission
  const validateForm = () => {
    if (!formData.email) {
      setError("Email is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    // Subdomain required for regular users, optional for super admin
    if (!isSuperAdmin && !formData.tenantSubdomain) {
      setError(
        "All fields are required. Subdomain is needed from backend to render on frontend."
      );
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    // Clear error when user starts typing
    if (error) setError("");

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // For super admin with empty subdomain, use "system"; otherwise use what user entered
      const subdomain =
        isSuperAdmin && !formData.tenantSubdomain
          ? "system"
          : formData.tenantSubdomain;
      await login(formData.email, formData.password, subdomain);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Login
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sign in to your account
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label
              htmlFor="tenantSubdomain"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tenant Subdomain <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="tenantSubdomain"
              name="tenantSubdomain"
              value={formData.tenantSubdomain}
              onChange={handleChange}
              placeholder="e.g., demo, mycompany"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              {isSuperAdmin
                ? "Super Admin: Leave empty if needed (auto-filled with system)"
                : "Your organization's subdomain (e.g., demo for demo.yourapp.com)"}
            </p>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
