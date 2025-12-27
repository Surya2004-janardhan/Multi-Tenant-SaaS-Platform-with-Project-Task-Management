// Database Seed Runner with Retry Mechanism
// Runs seed data SQL file

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { Pool } = require("pg");

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Use Neon DB in production, local Docker DB in development
const isProduction = process.env.NODE_ENV === "production";
const localDbUrl = "postgresql://postgres:postgres@database:5432/saas_db";
const neonDbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const useDbUrl = isProduction ? neonDbUrl : localDbUrl;
const isCloudDb =
  useDbUrl &&
  (useDbUrl.includes("neon.tech") ||
    useDbUrl.includes("render.com") ||
    useDbUrl.includes("aws.neon.tech"));

const pool = new Pool({
  connectionString: useDbUrl,
  ...(isCloudDb
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {}),
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

const runSeeds = async () => {
  try {
    console.log("==============================================");
    console.log("🌱 Starting database seeding...");
    console.log("==============================================\n");

    const seedsPath = path.join(__dirname, "seeds");
    const seedFiles = fs
      .readdirSync(seedsPath)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of seedFiles) {
      console.log(`⏳ Running seed: ${file}`);
      const filePath = path.join(seedsPath, file);
      const sql = fs.readFileSync(filePath, "utf8");

      await queryWithRetry(sql);
      console.log(`✅ Completed: ${file}\n`);
    }

    console.log("==============================================");
    console.log("✅ All seeds completed successfully!");
    console.log("==============================================");
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runSeeds();
