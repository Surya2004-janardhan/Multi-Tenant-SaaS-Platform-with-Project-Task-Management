// Projects Page Component
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectService } from "../services/projectService";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll(1, 50);
      setProjects(response.data.projects || []);
    } catch (err) {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await projectService.create(formData);
      setFormData({ name: "", description: "" });
      setShowModal(false);
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      await projectService.delete(id);
      loadProjects();
    } catch (err) {
      alert("Failed to delete project");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 text-lg">Loading projects...</div>
      </div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <button
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition"
          onClick={() => setShowModal(true)}
        >
          + New Project
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No projects yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first project to get started
          </p>
          <button
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition"
            onClick={() => setShowModal(true)}
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {project.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === "active"
                      ? "bg-green-100 text-green-800"
                      : project.status === "planning"
                      ? "bg-blue-100 text-blue-800"
                      : project.status === "on_hold"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                {project.description || "No description"}
              </p>
              <div className="flex justify-between items-center pt-4 border-t">
                <small className="text-gray-500">
                  Tasks: {project.task_count || 0}
                </small>
                <div className="flex gap-2">
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Project
            </h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-lg font-medium transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
