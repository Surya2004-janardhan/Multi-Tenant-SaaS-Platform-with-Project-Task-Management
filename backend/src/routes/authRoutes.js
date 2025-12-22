// Authentication Routes
// Routes: POST /register-tenant, POST /login, GET /me, POST /logout

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticate = require("../middleware/auth");
const {
  validateRegistration,
  validateLogin,
} = require("../middleware/validation");

// POST /api/auth/register - Register new tenant with admin user
router.post("/register", validateRegistration, authController.registerTenant);

// POST /api/auth/login - Login user
router.post("/login", validateLogin, authController.login);

// GET /api/auth/me - Get current user profile
router.get("/me", authenticate, authController.getProfile);

// POST /api/auth/logout - Logout user
router.post("/logout", authenticate, authController.logout);

module.exports = router;
