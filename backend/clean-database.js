// Clean database and re-seed with demo data only
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : false,
});

async function cleanDatabase() {
  console.log("🧹 Cleaning database...");

  try {
    // Delete all data in reverse order (respect foreign keys)
    await pool.query("DELETE FROM audit_logs");
    await pool.query("DELETE FROM tasks");
    await pool.query("DELETE FROM projects");
    await pool.query("DELETE FROM users");
    await pool.query("DELETE FROM tenants");

    // Reset sequences
    await pool.query("SELECT setval('tenants_id_seq', 1, false)");
    await pool.query("SELECT setval('users_id_seq', 1, false)");
    await pool.query("SELECT setval('projects_id_seq', 1, false)");
    await pool.query("SELECT setval('tasks_id_seq', 1, false)");
    await pool.query("SELECT setval('audit_logs_id_seq', 1, false)");

    console.log("✅ Database cleaned successfully");

    // Now re-seed with demo data
    console.log("\n📦 Re-seeding demo data...");
    const fs = require("fs");
    const path = require("path");

    const seedSQL = fs.readFileSync(
      path.join(__dirname, "database", "seeds", "001_seed_data.sql"),
      "utf8"
    );

    await pool.query(seedSQL);
    console.log("✅ Demo data seeded successfully");

    // Verify
    const tenantsResult = await pool.query("SELECT COUNT(*) FROM tenants");
    const usersResult = await pool.query("SELECT COUNT(*) FROM users");
    const projectsResult = await pool.query("SELECT COUNT(*) FROM projects");
    const tasksResult = await pool.query("SELECT COUNT(*) FROM tasks");

    console.log("\n📊 Database Summary:");
    console.log(`   Tenants: ${tenantsResult.rows[0].count}`);
    console.log(`   Users: ${usersResult.rows[0].count}`);
    console.log(`   Projects: ${projectsResult.rows[0].count}`);
    console.log(`   Tasks: ${tasksResult.rows[0].count}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

cleanDatabase();
