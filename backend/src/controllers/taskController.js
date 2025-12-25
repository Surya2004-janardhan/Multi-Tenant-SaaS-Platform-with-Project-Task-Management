// Task Controller
// Handles: create task, list tasks, get task, update task status, update task, delete task

const taskModel = require("../models/taskModel");
const projectModel = require("../models/projectModel");
const { logAction } = require("../services/auditService");
const {
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");
const {
  AUDIT_ACTIONS,
  TASK_STATUS,
  TASK_PRIORITY,
} = require("../utils/constants");

const createTask = async (req, res, next) => {
  try {
    const { tenantId, userId, role } = req.user;
    const { projectId, title, description, priority, dueDate, assignedTo } =
      req.body;

    // Super admin cannot create tasks (they have tenant_id = NULL)
    if (role === "super_admin" || tenantId === null) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "Super admin cannot create tasks. Please login as a tenant admin or user to create tasks."
          )
        );
    }

    // Verify project exists and belongs to tenant
    const project = await projectModel.findById(projectId, tenantId);
    if (!project) {
      return res.status(404).json(buildErrorResponse("Project not found"));
    }

    // Create task
    const task = await taskModel.create({
      project_id: projectId,
      tenant_id: tenantId,
      title,
      description,
      priority: priority || TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.TODO,
      due_date: dueDate || null,
      assigned_to: assignedTo || null,
      created_by: userId,
    });

    // Log action
    await logAction({
      tenantId,
      userId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: "task",
      entityId: task.id,
      ipAddress: req.ip,
    });

    return res
      .status(201)
      .json(buildSuccessResponse(task, "Task created successfully"));
  } catch (error) {
    next(error);
  }
};

const getTasksByProject = async (req, res, next) => {
  try {
    const { tenantId, role } = req.user;
    const { projectId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || null;
    const priority = req.query.priority || null;
    const assignedTo = req.query.assignedTo || null;

    // Verify project exists
    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json(buildErrorResponse("Project not found"));
    }

    // For non-super admins, verify project belongs to their tenant
    if (
      role !== "super_admin" &&
      tenantId !== null &&
      project.tenant_id !== tenantId
    ) {
      return res.status(404).json(buildErrorResponse("Project not found"));
    }

    const tasks = await taskModel.findByProject(projectId, {
      status,
      priority,
      assignedTo,
      page,
      limit,
    });

    return res.status(200).json(buildSuccessResponse(tasks));
  } catch (error) {
    next(error);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { tenantId, role } = req.user;
    const projectId = req.query.project_id || null;
    const status = req.query.status || null;
    const priority = req.query.priority || null;
    const assignedTo = req.query.assignedTo || null;

    let tasks;

    // Super admin can see ALL tasks from ALL tenants
    if (role === "super_admin" || tenantId === null) {
      if (projectId) {
        tasks = await taskModel.findByProject(
          projectId,
          null, // null tenant means all tenants
          1,
          100,
          status,
          priority,
          assignedTo
        );
      } else {
        tasks = await taskModel.findAllTasks(status, priority, assignedTo);
      }
    } else {
      // Regular users see only their tenant's tasks
      if (projectId) {
        tasks = await taskModel.findByProject(
          projectId,
          tenantId,
          1,
          100,
          status,
          priority,
          assignedTo
        );
      } else {
        tasks = await taskModel.findByTenant(
          tenantId,
          status,
          priority,
          assignedTo
        );
      }
    }

    return res.status(200).json(buildSuccessResponse(tasks));
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;

    const task = await taskModel.findById(id, tenantId);
    if (!task) {
      return res.status(404).json(buildErrorResponse("Task not found"));
    }

    return res.status(200).json(buildSuccessResponse(task));
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const { title, description, priority, status, dueDate, assignedTo } =
      req.body;

    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority) updates.priority = priority;
    if (status) updates.status = status;
    if (dueDate !== undefined) updates.due_date = dueDate;
    if (assignedTo !== undefined) updates.assigned_to = assignedTo;

    const updatedTask = await taskModel.update(id, tenantId, updates);
    if (!updatedTask) {
      return res.status(404).json(buildErrorResponse("Task not found"));
    }

    // Log action
    await logAction({
      tenantId,
      userId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: "task",
      entityId: id,
      ipAddress: req.ip,
    });

    return res
      .status(200)
      .json(buildSuccessResponse(updatedTask, "Task updated successfully"));
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json(buildErrorResponse("Status is required"));
    }

    // Validate status enum
    const validStatuses = ["todo", "in_progress", "completed"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json(
          buildErrorResponse(
            "Invalid status value. Must be one of: todo, in_progress, completed"
          )
        );
    }

    const updatedTask = await taskModel.update(id, tenantId, { status });
    if (!updatedTask) {
      return res.status(404).json(buildErrorResponse("Task not found"));
    }

    // Log action
    await logAction({
      tenantId,
      userId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: "task",
      entityId: id,
      ipAddress: req.ip,
    });

    return res
      .status(200)
      .json(
        buildSuccessResponse(updatedTask, "Task status updated successfully")
      );
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;

    const deleted = await taskModel.deleteById(id, tenantId);
    if (!deleted) {
      return res.status(404).json(buildErrorResponse("Task not found"));
    }

    // Log action
    await logAction({
      tenantId,
      userId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: "task",
      entityId: id,
      ipAddress: req.ip,
    });

    return res
      .status(200)
      .json(buildSuccessResponse(null, "Task deleted successfully"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTasksByProject,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
