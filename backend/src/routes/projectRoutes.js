// Project Routes
// Routes: POST /projects, GET /projects, GET /projects/:id, PUT /projects/:id, DELETE /projects/:id

const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authenticate = require("../middleware/auth");
const tenantContext = require("../middleware/tenantContext");
const { validateCreateProject } = require("../middleware/validation");

// POST /api/projects - Create new project
router.post(
  "/",
  authenticate,
  tenantContext,
  validateCreateProject,
  projectController.createProject
);

// GET /api/projects - Get all projects in tenant
router.get(
  "/",
  authenticate,
  tenantContext,
  projectController.getProjectsByTenant
);

// GET /api/projects/:id - Get project by ID
router.get(
  "/:id",
  authenticate,
  tenantContext,
  projectController.getProjectById
);

// PUT /api/projects/:id - Update project
router.put(
  "/:id",
  authenticate,
  tenantContext,
  projectController.updateProject
);

// DELETE /api/projects/:id - Delete project
router.delete(
  "/:id",
  authenticate,
  tenantContext,
  projectController.deleteProject
);

module.exports = router;
