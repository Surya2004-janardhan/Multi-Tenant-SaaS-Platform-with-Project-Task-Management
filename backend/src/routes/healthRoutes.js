// Health Routes
// Routes: GET /health

const express = require("express");
const router = express.Router();
const healthController = require("../controllers/healthController");

// GET /api/health - Health check
router.get("/", healthController.healthCheck);

module.exports = router;
