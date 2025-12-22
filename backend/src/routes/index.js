// Route Index
// Aggregates all route modules

const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const tenantRoutes = require("./tenantRoutes");
const userRoutes = require("./userRoutes");
const projectRoutes = require("./projectRoutes");
const taskRoutes = require("./taskRoutes");
const healthRoutes = require("./healthRoutes");

// Mount routes
router.use("/auth", authRoutes);
router.use("/tenants", tenantRoutes);
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/health", healthRoutes);

module.exports = router;
