// Navigation Component
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link
              to="/dashboard"
              className="text-xl font-bold text-primary-500 hover:text-primary-600"
            >
              Multi-Tenant SaaS
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-primary-500 font-medium transition"
              >
                Dashboard
              </Link>
              <Link
                to="/projects"
                className="text-gray-700 hover:text-primary-500 font-medium transition"
              >
                Projects
              </Link>
              {user?.role === "tenant_admin" && (
                <Link
                  to="/users"
                  className="text-gray-700 hover:text-primary-500 font-medium transition"
                >
                  Users
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.fullName || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
