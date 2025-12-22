// Navigation Component
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/dashboard">Multi-Tenant SaaS</Link>
      </div>
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/projects">Projects</Link>
        {user?.role === "tenant_admin" && <Link to="/users">Users</Link>}
      </div>
      <div className="nav-user">
        <span>{user?.fullName || user?.email}</span>
        <button onClick={handleLogout} className="btn btn-sm">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
