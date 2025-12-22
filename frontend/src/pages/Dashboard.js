// Dashboard Page Component
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [stats, setStats] = useState({ projects: 0, tasks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const projectsRes = await projectService.getAll(1, 5);
      setProjects(projectsRes.data.data || []);
      setStats((prev) => ({ ...prev, projects: projectsRes.data.total || 0 }));

      if (projectsRes.data.data?.length > 0) {
        const tasksRes = await taskService.getByProject(
          projectsRes.data.data[0].id,
          1,
          5
        );
        setRecentTasks(tasksRes.data.data || []);
        setStats((prev) => ({ ...prev, tasks: tasksRes.data.total || 0 }));
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.fullName || user?.email}!</h1>
        <p>Here's what's happening with your projects</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <div className="stat-number">{stats.projects}</div>
        </div>
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <div className="stat-number">{stats.tasks}</div>
        </div>
        <div className="stat-card">
          <h3>Your Role</h3>
          <div className="stat-text">
            {user?.role?.replace("_", " ").toUpperCase()}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Projects</h2>
            <Link to="/projects" className="btn btn-sm">
              View All
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="empty-state">
              <p>No projects yet</p>
              <Link to="/projects" className="btn btn-primary">
                Create Your First Project
              </Link>
            </div>
          ) : (
            <div className="project-list">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="project-item"
                >
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                  </div>
                  <span className={`badge badge-${project.status}`}>
                    {project.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Tasks</h2>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet</p>
            </div>
          ) : (
            <div className="task-list">
              {recentTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div>
                    <h4>{task.title}</h4>
                    <p className="task-meta">
                      <span className={`priority priority-${task.priority}`}>
                        {task.priority}
                      </span>
                      <span className={`status status-${task.status}`}>
                        {task.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
