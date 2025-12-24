// Task Routes
// Routes: POST /projects/:id/tasks, GET /projects/:id/tasks, GET /tasks/:id, PATCH /tasks/:id/status, PUT /tasks/:id, DELETE /tasks/:id

const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authenticate = require("../middleware/auth");
const tenantContext = require("../middleware/tenantContext");
const { validateCreateTask } = require("../middleware/validation");

// POST /api/tasks - Create new task
router.post(
  "/",
  authenticate,
  tenantContext,
  validateCreateTask,
  taskController.createTask
);

// GET /api/tasks - Get all tasks (with optional filters)
router.get("/", authenticate, tenantContext, taskController.getAllTasks);

// GET /api/tasks/project/:projectId - Get all tasks for a project
router.get(
  "/project/:projectId",
  authenticate,
  tenantContext,
  taskController.getTasksByProject
);

// GET /api/tasks/:id - Get task by ID
router.get("/:id", authenticate, tenantContext, taskController.getTaskById);

// PUT /api/tasks/:id - Update task
router.put("/:id", authenticate, tenantContext, taskController.updateTask);

// PATCH /api/tasks/:id/status - Update task status
router.patch(
  "/:id/status",
  authenticate,
  tenantContext,
  taskController.updateTaskStatus
);

// DELETE /api/tasks/:id - Delete task
router.delete("/:id", authenticate, tenantContext, taskController.deleteTask);

module.exports = router;
