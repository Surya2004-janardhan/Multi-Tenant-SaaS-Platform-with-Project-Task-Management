// Validation Middleware
// Input validation for API requests

const { buildErrorResponse } = require("../utils/helpers");
const {
  isValidEmail,
  isValidSubdomain,
  isValidPassword,
  isValidRole,
  isValidStatus,
  isValidPriority,
  isValidPlan,
} = require("../utils/validators");

const validateRegistration = (req, res, next) => {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } =
    req.body;
  const errors = [];

  if (!tenantName || tenantName.trim().length === 0) {
    errors.push({ field: "tenantName", message: "Tenant name is required" });
  }

  if (!subdomain || !isValidSubdomain(subdomain)) {
    errors.push({
      field: "subdomain",
      message:
        "Invalid subdomain format. Must be 3-63 characters, alphanumeric and hyphens only",
    });
  }

  if (!adminEmail || !isValidEmail(adminEmail)) {
    errors.push({ field: "adminEmail", message: "Invalid email format" });
  }

  if (!adminPassword || !isValidPassword(adminPassword)) {
    errors.push({
      field: "adminPassword",
      message: "Password must be at least 8 characters",
    });
  }

  if (!adminFullName || adminFullName.trim().length === 0) {
    errors.push({
      field: "adminFullName",
      message: "Admin full name is required",
    });
  }

  if (errors.length > 0) {
    return res
      .status(400)
      .json(buildErrorResponse("Validation failed", errors));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password, tenantSubdomain } = req.body;
  const errors = [];
  const SUPER_ADMIN_EMAIL = "superadmin@system.com";

  if (!email || !isValidEmail(email)) {
    errors.push({ field: "email", message: "Valid email is required" });
  }

  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  }

  // Subdomain required for regular users (check if undefined or null, not empty string)
  // Super admin can have empty or missing subdomain
  if (
    email !== SUPER_ADMIN_EMAIL &&
    (tenantSubdomain === undefined || tenantSubdomain === null)
  ) {
    errors.push({
      field: "tenantSubdomain",
      message: "Tenant subdomain is required for non-admin users",
    });
  }

  if (errors.length > 0) {
    return res
      .status(400)
      .json(buildErrorResponse("Validation failed", errors));
  }

  next();
};

const validateCreateUser = (req, res, next) => {
  const { email, password, fullName, role } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push({ field: "email", message: "Valid email is required" });
  }

  if (!password || !isValidPassword(password)) {
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters",
    });
  }

  if (!fullName || fullName.trim().length === 0) {
    errors.push({ field: "fullName", message: "Full name is required" });
  }

  if (role && !isValidRole(role)) {
    errors.push({ field: "role", message: "Invalid role" });
  }

  if (errors.length > 0) {
    return res
      .status(400)
      .json(buildErrorResponse("Validation failed", errors));
  }

  next();
};

const validateCreateProject = (req, res, next) => {
  const { name } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push({ field: "name", message: "Project name is required" });
  }

  if (errors.length > 0) {
    return res
      .status(400)
      .json(buildErrorResponse("Validation failed", errors));
  }

  next();
};

const validateCreateTask = (req, res, next) => {
  const { title, status } = req.body;
  const errors = [];
  const VALID_STATUSES = ["todo", "in_progress", "completed"];

  if (!title || title.trim().length === 0) {
    errors.push({ field: "title", message: "Task title is required" });
  }

  if (status && !VALID_STATUSES.includes(status)) {
    errors.push({
      field: "status",
      message: "Invalid status. Must be one of: todo, in_progress, completed",
    });
  }

  if (errors.length > 0) {
    return res
      .status(400)
      .json(buildErrorResponse("Validation failed", errors));
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateCreateUser,
  validateCreateProject,
  validateCreateTask,
};
