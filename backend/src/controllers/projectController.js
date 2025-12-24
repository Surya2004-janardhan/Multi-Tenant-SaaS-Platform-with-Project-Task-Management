// Project Controller
// Handles: create project, list projects, get project, update project, delete project

const projectModel = require("../models/projectModel");
const { checkProjectLimit } = require("../services/subscriptionService");
const { logAction } = require("../services/auditService");
const {
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");
const { AUDIT_ACTIONS, PROJECT_STATUS } = require("../utils/constants");

const createProject = async (req, res, next) => {
  try {
    const { tenantId, userId } = req.user;
    const { name, description } = req.body;

    // Check subscription limit
    const limitCheck = await checkProjectLimit(tenantId);
    if (!limitCheck.canAdd) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            `Project limit reached. Current: ${limitCheck.current}, Limit: ${limitCheck.limit}`
          )
        );
    }

    // Create project
    const project = await projectModel.create({
      tenant_id: tenantId,
      name,
      description,
      status: PROJECT_STATUS.ACTIVE,
      created_by: userId,
    });

    // Log action
    await logAction({
      tenantId,
      userId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: "project",
      entityId: project.id,
      ipAddress: req.ip,
    });

    return res
      .status(201)
      .json(buildSuccessResponse(project, "Project created successfully"));
  } catch (error) {
    next(error);
  }
};

const getProjectsByTenant = async (req, res, next) => {
  try {
    const { tenantId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;

    const projects = await projectModel.findByTenant(tenantId, {
      page,
      limit,
      status,
    });

    return res.status(200).json(buildSuccessResponse(projects));
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;

    const project = await projectModel.findById(id, tenantId);
    if (!project) {
      return res.status(404).json(buildErrorResponse("Project not found"));
    }

    return res.status(200).json(buildSuccessResponse(project));
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const { name, description, status } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status) updates.status = status;

    const updatedProject = await projectModel.update(id, updates);
    if (!updatedProject) {
      return res.status(404).json(buildErrorResponse("Project not found"));
    }

    // Log action
    await logAction({
      tenantId,
      userId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: "project",
      entityId: id,
      ipAddress: req.ip,
    });

    return res
      .status(200)
      .json(
        buildSuccessResponse(updatedProject, "Project updated successfully")
      );
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;

    const deleted = await projectModel.deleteById(id, tenantId);
    if (!deleted) {
      return res.status(404).json(buildErrorResponse("Project not found"));
    }

    // Log action
    await logAction({
      tenantId,
      userId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: "project",
      entityId: id,
      ipAddress: req.ip,
    });

    return res
      .status(200)
      .json(buildSuccessResponse(null, "Project deleted successfully"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjectsByTenant,
  getProjectById,
  updateProject,
  deleteProject,
};
