const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function removeDuplicateSuperAdmin() {
  try {
    console.log("🔧 Removing duplicate super admin entries...");

    // First, check what we have
    const check = await pool.query(
      "SELECT id, email, role, tenant_id FROM users WHERE email = 'superadmin@system.com' ORDER BY id"
    );

    console.log("\nCurrent entries:");
    console.log(check.rows);

    // Delete the one with tenant_id = 1 (the incorrect one)
    const deleteResult = await pool.query(
      "DELETE FROM users WHERE email = 'superadmin@system.com' AND tenant_id IS NOT NULL"
    );

    console.log(
      `\n✅ Deleted ${deleteResult.rowCount} duplicate entry/entries`
    );

    // Verify
    const verify = await pool.query(
      "SELECT id, email, role, tenant_id FROM users WHERE email = 'superadmin@system.com'"
    );

    console.log("\nRemaining entry:");
    console.log(verify.rows);

    await pool.end();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

removeDuplicateSuperAdmin();
