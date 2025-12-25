// Database configuration and connection
// PostgreSQL connection pool setup with retry mechanism

const { Pool } = require("pg");
require("dotenv").config();

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second delay between retries

// Support both DATABASE_URL (Neon/Heroku/Render) and individual DB_* variables
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased to 10 seconds
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || "saas_db",
      user: process.env.DB_USER || "postgres",
      password: String(process.env.DB_PASSWORD) || "postgres",
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });

pool.on("error", (err) => {
  console.error("⚠️ Unexpected error on idle client:", err.message);
  // Don't exit process immediately, let retry mechanism handle it
});

// Helper function to add delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to check if error is retryable
const isRetryableError = (error) => {
  const retryableErrors = [
    "Connection terminated",
    "connection timeout",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ENOTFOUND",
    "ECONNRESET",
    "Connection terminated unexpectedly",
  ];

  return retryableErrors.some(
    (msg) => error.message?.includes(msg) || error.cause?.message?.includes(msg)
  );
};

// Query with retry mechanism
const query = async (text, params) => {
  const start = Date.now();
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 DB Query Attempt ${attempt}/${MAX_RETRIES}`);
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log(
        `✅ Query executed successfully: ${duration}ms, rows: ${res.rowCount}`
      );
      return res;
    } catch (error) {
      lastError = error;
      const errorMsg = error.message || error.cause?.message || "Unknown error";

      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        console.warn(`⚠️ Attempt ${attempt} failed: ${errorMsg}`);
        console.log(`⏳ Retrying in ${RETRY_DELAY_MS}ms...`);
        await delay(RETRY_DELAY_MS * attempt); // Exponential backoff
      } else {
        console.error(`❌ Query failed after ${attempt} attempts: ${errorMsg}`);
        break;
      }
    }
  }

  throw lastError;
};

// Get client with retry mechanism
const getClient = async () => {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 Getting DB client - Attempt ${attempt}/${MAX_RETRIES}`);
      const client = await pool.connect();
      console.log(`✅ DB client connected successfully`);
      return client;
    } catch (error) {
      lastError = error;
      const errorMsg = error.message || "Unknown error";

      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        console.warn(`⚠️ Connection attempt ${attempt} failed: ${errorMsg}`);
        console.log(`⏳ Retrying in ${RETRY_DELAY_MS}ms...`);
        await delay(RETRY_DELAY_MS * attempt);
      } else {
        console.error(
          `❌ Failed to get client after ${attempt} attempts: ${errorMsg}`
        );
        break;
      }
    }
  }

  throw lastError;
};

module.exports = {
  query,
  pool,
  getClient,
};
