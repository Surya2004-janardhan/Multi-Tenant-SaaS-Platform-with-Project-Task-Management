// User Routes
// Routes: POST /tenants/:id/users, GET /tenants/:id/users, GET /users/:id, PUT /users/:id, DELETE /users/:id

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require("../middleware/auth");
const tenantContext = require("../middleware/tenantContext");
const { isTenantAdmin } = require("../middleware/authorize");
const { validateCreateUser } = require("../middleware/validation");

// POST /api/users - Create new user (tenant admin only)
router.post(
  "/",
  authenticate,
  tenantContext,
  isTenantAdmin,
  validateCreateUser,
  userController.createUser
);

// GET /api/users - Get all users in tenant
router.get("/", authenticate, tenantContext, userController.getUsersByTenant);

// PUT /api/users/:id - Update user (tenant admin only)
router.put(
  "/:id",
  authenticate,
  tenantContext,
  isTenantAdmin,
  userController.updateUser
);

// DELETE /api/users/:id - Delete user (tenant admin only)
router.delete(
  "/:id",
  authenticate,
  tenantContext,
  isTenantAdmin,
  userController.deleteUser
);

module.exports = router;
