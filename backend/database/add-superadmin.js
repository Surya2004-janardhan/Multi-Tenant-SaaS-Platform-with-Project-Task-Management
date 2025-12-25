// Add super admin to database
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

const addSuperAdmin = async () => {
  try {
    console.log("==============================================");
    console.log("👤 Adding Super Admin...");
    console.log("==============================================\n");

    const sql = fs.readFileSync(
      path.join(__dirname, "add-superadmin.sql"),
      "utf8"
    );
    await pool.query(sql);

    console.log("✅ Super admin configured successfully!");
    console.log("\n📧 Email: superadmin@system.com");
    console.log("🔑 Password: Admin@123");
    console.log("==============================================");
  } catch (error) {
    console.error("❌ Failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

addSuperAdmin();
