// CORS configuration
// Cross-Origin Resource Sharing settings

require("dotenv").config();

// Allow multiple origins for development and production
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://task3-omega-neon.vercel.app",
  "https://multi-tenant-saas-platform-with-project.onrender.com",
  "https://task3-bt0eo5i4d-suryas-projects-ab9ff4b8.vercel.app",
  // https://task3-bt0eo5i4d-suryas-projects-ab9ff4b8.vercel.app/register
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn("⚠️ CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-tenant-subdomain"],
};

module.exports = corsOptions;
