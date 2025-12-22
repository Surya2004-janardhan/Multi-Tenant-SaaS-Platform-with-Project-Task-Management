// Register Page Component
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    tenantName: "",
    subdomain: "",
    adminEmail: "",
    adminPassword: "",
    adminFullName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        setError(errors.map((e) => e.message).join(", "));
      } else {
        setError(
          err.response?.data?.message ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Register</h1>
        <p className="subtitle">Create your tenant account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tenantName">Company Name</label>
            <input
              type="text"
              id="tenantName"
              name="tenantName"
              value={formData.tenantName}
              onChange={handleChange}
              placeholder="Your Company Name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subdomain">Subdomain</label>
            <input
              type="text"
              id="subdomain"
              name="subdomain"
              value={formData.subdomain}
              onChange={handleChange}
              placeholder="mycompany (3-63 characters)"
              pattern="[a-z0-9-]{3,63}"
              required
            />
            <small>Only lowercase letters, numbers, and hyphens</small>
          </div>

          <div className="form-group">
            <label htmlFor="adminFullName">Your Full Name</label>
            <input
              type="text"
              id="adminFullName"
              name="adminFullName"
              value={formData.adminFullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminEmail">Email</label>
            <input
              type="email"
              id="adminEmail"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleChange}
              placeholder="admin@company.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminPassword">Password</label>
            <input
              type="password"
              id="adminPassword"
              name="adminPassword"
              value={formData.adminPassword}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              minLength="8"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
