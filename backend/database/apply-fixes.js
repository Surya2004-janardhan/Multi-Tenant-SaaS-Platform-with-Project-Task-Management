// Quick Schema Fix Script
// Applies all schema fixes to existing Neon database

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

const runFix = async () => {
  try {
    console.log("==============================================");
    console.log("🔧 Fixing database schema...");
    console.log("==============================================\n");

    const fixes = ["fix-schema.sql", "fix-users.sql", "fix-status.sql"];

    for (const file of fixes) {
      console.log(`⏳ Applying: ${file}`);
      const sql = fs.readFileSync(path.join(__dirname, file), "utf8");
      await pool.query(sql);
      console.log(`✅ Completed: ${file}\n`);
    }

    console.log("==============================================");
    console.log("✅ Schema fixes applied successfully!");
    console.log("==============================================");
  } catch (error) {
    console.error("❌ Fix failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runFix();
