// Task Controller
// Handles: create task, list tasks, get task, update task status, update task, delete task

const taskModel = require('../models/taskModel');
const projectModel = require('../models/projectModel');
const { logAction } = require('../services/auditService');
const { buildSuccessResponse, buildErrorResponse } = require('../utils/helpers');
const { AUDIT_ACTIONS, TASK_STATUS, TASK_PRIORITY } = require('../utils/constants');

const createTask = async (req, res, next) => {
  try {
    const { tenantId, userId } = req.user;
    const { projectId, title, description, priority, dueDate, assignedTo } = req.body;

    // Verify project exists and belongs to tenant
    const project = await projectModel.findById(projectId, tenantId);
    if (!project) {
      return res.status(404).json(
        buildErrorResponse('Project not found')
      );
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
    });

    // Log action
    await logAction({
      tenantId,
      userId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'task',
      entityId: task.id,
      ipAddress: req.ip,
    });

    return res.status(201).json(
      buildSuccessResponse(task, 'Task created successfully')
    );
  } catch (error) {
    next(error);
  }
};

const getTasksByProject = async (req, res, next) => {
  try {
    const { tenantId } = req.user;
    const { projectId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || null;
    const priority = req.query.priority || null;
    const assignedTo = req.query.assignedTo || null;

    // Verify project exists and belongs to tenant
    const project = await projectModel.findById(projectId, tenantId);
    if (!project) {
      return res.status(404).json(
        buildErrorResponse('Project not found')
      );
    }

    const tasks = await taskModel.findByProject(projectId, tenantId, page, limit, status, priority, assignedTo);

    return res.status(200).json(
      buildSuccessResponse(tasks)
    );
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
      return res.status(404).json(
        buildErrorResponse('Task not found')
      );
    }

    return res.status(200).json(
      buildSuccessResponse(task)
    );
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const { title, description, priority, status, dueDate, assignedTo } = req.body;

    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority) updates.priority = priority;
    if (status) updates.status = status;
    if (dueDate !== undefined) updates.due_date = dueDate;
    if (assignedTo !== undefined) updates.assigned_to = assignedTo;

    const updatedTask = await taskModel.update(id, tenantId, updates);
    if (!updatedTask) {
      return res.status(404).json(
        buildErrorResponse('Task not found')
      );
    }

    // Log action
    await logAction({
      tenantId,
      userId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'task',
      entityId: id,
      ipAddress: req.ip,
    });

    return res.status(200).json(
      buildSuccessResponse(updatedTask, 'Task updated successfully')
    );
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
      return res.status(400).json(
        buildErrorResponse('Status is required')
      );
    }

    const updatedTask = await taskModel.update(id, tenantId, { status });
    if (!updatedTask) {
      return res.status(404).json(
        buildErrorResponse('Task not found')
      );
    }

    // Log action
    await logAction({
      tenantId,
      userId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'task',
      entityId: id,
      ipAddress: req.ip,
    });

    return res.status(200).json(
      buildSuccessResponse(updatedTask, 'Task status updated successfully')
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
      return res.status(404).json(
        buildErrorResponse('Task not found')
      );
    }

    // Log action
    await logAction({
      tenantId,
      userId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'task',
      entityId: id,
      ipAddress: req.ip,
    });

    return res.status(200).json(
      buildSuccessResponse(null, 'Task deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
