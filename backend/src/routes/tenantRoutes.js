// Tenant Routes
// Routes: GET /tenants, GET /tenants/:id, PUT /tenants/:id

const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const authenticate = require("../middleware/auth");
const { isSuperAdmin } = require("../middleware/authorize");

// GET /api/tenants - Get all tenants
router.get("/", authenticate, isSuperAdmin, tenantController.getAllTenants);

// GET /api/tenants/:id - Get tenant by ID
router.get("/:id", authenticate, isSuperAdmin, tenantController.getTenantById);

// PUT /api/tenants/:id - Update tenant
router.put("/:id", authenticate, isSuperAdmin, tenantController.updateTenant);

module.exports = router;
