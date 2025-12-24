// Dashboard Page Component
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";

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
      setProjects(projectsRes.data.projects || []);
      setStats((prev) => ({ ...prev, projects: projectsRes.data.total || 0 }));

      if (projectsRes.data.projects?.length > 0) {
        const tasksRes = await taskService.getByProject(
          projectsRes.data.projects[0].id,
          1,
          5
        );
        setRecentTasks(tasksRes.data.tasks || []);
        setStats((prev) => ({ ...prev, tasks: tasksRes.data.total || 0 }));
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.fullName || user?.email}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your projects
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Projects
          </h3>
          <div className="text-3xl font-bold text-primary-600">
            {stats.projects}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Tasks
          </h3>
          <div className="text-3xl font-bold text-primary-600">
            {stats.tasks}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Your Role</h3>
          <div className="text-xl font-semibold text-gray-800">
            {user?.role?.replace("_", " ").toUpperCase()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
            <Link
              to="/projects"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              View All
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No projects yet</p>
              <Link
                to="/projects"
                className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Create Your First Project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {project.description}
                      </p>
                    </div>
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
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Tasks</h2>
          </div>
          {recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {task.title}
                    </h4>
                    <p className="flex gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          task.status === "todo"
                            ? "bg-blue-100 text-blue-800"
                            : task.status === "in_progress"
                            ? "bg-purple-100 text-purple-800"
                            : task.status === "done"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.status.replace("_", " ")}
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
