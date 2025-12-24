// Project Detail Page Component
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectService.getById(id),
        taskService.getByProject(id, 1, 50),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data.tasks || []);
    } catch (err) {
      console.error("Failed to load project:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskService.create({
        projectId: id,
        ...formData,
      });
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
      });
      setShowModal(false);
      loadProjectData();
    } catch (err) {
      alert("Failed to create task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      loadProjectData();
    } catch (err) {
      alert("Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await taskService.delete(taskId);
      loadProjectData();
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 text-lg">Loading project...</div>
      </div>
    );
  if (!project)
    return (
      <div className="text-center py-16 text-gray-600">Project not found</div>
    );

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => navigate("/projects")}
          className="text-primary-600 hover:text-primary-700 font-medium mb-4 flex items-center gap-1"
        >
          ← Back to Projects
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {project.name}
            </h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <button
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition"
            onClick={() => setShowModal(true)}
          >
            + New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["todo", "in_progress", "done"].map((status) => (
          <div key={status} className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-1 flex justify-between items-center">
              <span>
                {status === "in_progress"
                  ? "IN PROGRESS"
                  : status.toUpperCase()}
              </span>
              <span className="bg-white px-2 py-1 rounded text-sm">
                {tasksByStatus[status].length}
              </span>
            </h3>
            <div className="space-y-3 mt-4">
              {tasksByStatus[status].map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {task.title}
                    </h4>
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
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {task.description}
                    </p>
                  )}
                  {task.due_date && (
                    <small className="text-xs text-gray-500 block mb-3">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </small>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {status !== "todo" && (
                      <button
                        onClick={() =>
                          handleStatusChange(
                            task.id,
                            status === "in_progress" ? "todo" : "in_progress"
                          )
                        }
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition"
                      >
                        ←
                      </button>
                    )}
                    {status !== "done" && (
                      <button
                        onClick={() =>
                          handleStatusChange(
                            task.id,
                            status === "todo" ? "in_progress" : "done"
                          )
                        }
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition"
                      >
                        →
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded transition ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

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
              Create New Task
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
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
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
