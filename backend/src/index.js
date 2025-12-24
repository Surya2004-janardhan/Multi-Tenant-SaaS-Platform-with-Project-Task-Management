// Express Application Entry Point
// Main server file

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const corsOptions = require("./config/cors");
const requestLogger = require("./middleware/requestLogger");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Request Logger - logs all API calls
app.use("/api", requestLogger);

// API Routes
app.use("/api", routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Multi-Tenant SaaS Platform API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      tenants: "/api/tenants",
      users: "/api/users",
      projects: "/api/projects",
      tasks: "/api/tasks",
    },
  });
});

// 404 Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`==============================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`==============================================`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  process.exit(0);
});
