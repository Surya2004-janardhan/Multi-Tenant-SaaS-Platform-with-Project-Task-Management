// Database Migration Runner
// Runs all migration files in order

require("dotenv").config({ path: "../.env" });
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

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

      await pool.query(sql);
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
