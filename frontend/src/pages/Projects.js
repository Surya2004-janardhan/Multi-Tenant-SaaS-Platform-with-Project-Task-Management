// Projects Page Component
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectService } from "../services/projectService";
import "../styles/Projects.css";

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
      setProjects(response.data.data || []);
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

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {projects.length === 0 ? (
        <div className="empty-state">
          <h2>No projects yet</h2>
          <p>Create your first project to get started</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.name}</h3>
                <span className={`badge badge-${project.status}`}>
                  {project.status}
                </span>
              </div>
              <p>{project.description || "No description"}</p>
              <div className="project-footer">
                <small>Tasks: {project.task_count || 0}</small>
                <div className="project-actions">
                  <Link to={`/projects/${project.id}`} className="btn btn-sm">
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="btn btn-sm btn-danger"
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="4"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
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
