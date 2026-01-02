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
    const { tenantId, userId, role } = req.user;
    const { name, description } = req.body;

    // Super admin cannot create projects (they have tenant_id = NULL)
    // They can only view/manage existing tenant projects
    if (role === "super_admin" || tenantId === null) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "Super admin cannot create projects. Please login as a tenant admin or user to create projects."
          )
        );
    }

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
      action: AUDIT_ACTIONS.CREATE_PROJECT,
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
    const { tenantId, role } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;

    let projects;

    // Super admin can see ALL projects from ALL tenants
    if (role === "super_admin" || tenantId === null) {
      projects = await projectModel.findAll({
        page,
        limit,
        status,
      });
    } else {
      // Regular users see only their tenant's projects
      projects = await projectModel.findByTenant(tenantId, {
        page,
        limit,
        status,
      });
    }

    return res.status(200).json(buildSuccessResponse(projects));
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const { tenantId, role } = req.user;
    const { id } = req.params;

    const project = await projectModel.findById(id);
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

    return res.status(200).json(buildSuccessResponse(project));
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { tenantId, userId, role } = req.user;
    const { id } = req.params;
    const { name, description, status } = req.body;

    // Verify project exists
    const existingProject = await projectModel.findById(id);
    if (!existingProject) {
      return res.status(404).json(buildErrorResponse("Project not found"));
    }

    // For non-super admins, verify project belongs to their tenant
    if (
      role !== "super_admin" &&
      tenantId !== null &&
      existingProject.tenant_id !== tenantId
    ) {
      return res.status(404).json(buildErrorResponse("Project not found"));
    }

    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status) updates.status = status;

    const updatedProject = await projectModel.update(id, updates);

    // Log action (use project's tenant_id for super admin)
    await logAction({
      tenantId: existingProject.tenant_id,
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
    const { tenantId, userId, role } = req.user;
    const { id } = req.params;

    // Verify project exists
    const existingProject = await projectModel.findById(id);
    if (!existingProject) {
      return res.status(404).json(buildErrorResponse("Project not found"));
    }

    // For non-super admins, verify project belongs to their tenant
    if (
      role !== "super_admin" &&
      tenantId !== null &&
      existingProject.tenant_id !== tenantId
    ) {
      return res.status(404).json(buildErrorResponse("Project not found"));
    }

    const deleted = await projectModel.deleteById(id);

    // Log action (use project's tenant_id for super admin)
    await logAction({
      tenantId: existingProject.tenant_id,
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
