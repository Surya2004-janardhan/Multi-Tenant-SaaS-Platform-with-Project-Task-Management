// Project Detail Page Component
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import "../styles/ProjectDetail.css";

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
      setTasks(tasksRes.data.data || []);
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

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return <div>Project not found</div>;

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo"),
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  return (
    <div className="project-detail">
      <div className="project-header">
        <div>
          <button onClick={() => navigate("/projects")} className="btn btn-sm">
            ← Back
          </button>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Task
        </button>
      </div>

      <div className="kanban-board">
        {["todo", "in-progress", "completed"].map((status) => (
          <div key={status} className="kanban-column">
            <h3 className="column-header">
              {status.toUpperCase().replace("-", " ")}
              <span className="task-count">{tasksByStatus[status].length}</span>
            </h3>
            <div className="task-list">
              {tasksByStatus[status].map((task) => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <h4>{task.title}</h4>
                    <span className={`priority priority-${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && <p>{task.description}</p>}
                  {task.due_date && (
                    <small className="due-date">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </small>
                  )}
                  <div className="task-actions">
                    {status !== "todo" && (
                      <button
                        onClick={() =>
                          handleStatusChange(
                            task.id,
                            status === "in-progress" ? "todo" : "in-progress"
                          )
                        }
                        className="btn btn-xs"
                      >
                        ← Move Left
                      </button>
                    )}
                    {status !== "completed" && (
                      <button
                        onClick={() =>
                          handleStatusChange(
                            task.id,
                            status === "todo" ? "in-progress" : "completed"
                          )
                        }
                        className="btn btn-xs"
                      >
                        Move Right →
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="btn btn-xs btn-danger"
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
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
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
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
