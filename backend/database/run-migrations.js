// Database Migration Runner with Retry Mechanism
// Runs all migration files in order

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { Pool } = require("pg");

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Support both DATABASE_URL and individual DB_* variables
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 10000,
      keepAlive: true,
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: String(process.env.DB_PASSWORD),
      connectionTimeoutMillis: 10000,
      keepAlive: true,
    });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const queryWithRetry = async (sql, maxRetries = MAX_RETRIES) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
      const result = await pool.query(sql);
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);
        console.log(`⏳ Retrying in ${RETRY_DELAY_MS}ms...`);
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError;
};

const runMigrations = async () => {
  try {
    console.log("==============================================");
    console.log("🚀 Starting database migrations...");
    console.log("==============================================\n");

    const migrationsPath = path.join(__dirname, "migrations");
    const migrationFiles = fs
      .readdirSync(migrationsPath)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of migrationFiles) {
      console.log(`⏳ Running migration: ${file}`);
      const filePath = path.join(migrationsPath, file);
      const sql = fs.readFileSync(filePath, "utf8");

      await queryWithRetry(sql);
      console.log(`✅ Completed: ${file}\n`);
    }

    console.log("==============================================");
    console.log("✅ All migrations completed successfully!");
    console.log("==============================================");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigrations();
