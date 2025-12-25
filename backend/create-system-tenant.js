const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function createSystemTenant() {
  try {
    console.log("🔧 Creating system tenant for super admin login...\n");

    // Check if system tenant already exists
    const checkTenant = await pool.query(
      "SELECT * FROM tenants WHERE subdomain = 'system'"
    );

    if (checkTenant.rows.length > 0) {
      console.log("✅ System tenant already exists!");
      console.log(checkTenant.rows[0]);
    } else {
      // Create system tenant
      const result = await pool.query(
        `INSERT INTO tenants (name, subdomain, status, subscription_plan, max_projects, max_users)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        ["System Admin", "system", "active", "enterprise", 999, 999]
      );

      console.log("✅ System tenant created successfully!");
      console.log(result.rows[0]);
    }

    console.log("\n📋 Super Admin Login Instructions:");
    console.log("━".repeat(50));
    console.log("Email:     superadmin@system.com");
    console.log("Password:  Admin@123");
    console.log("Subdomain: system  ← Use this for super admin login");
    console.log("━".repeat(50));
    console.log(
      "\nNote: Super admin can also login using ANY tenant subdomain"
    );
    console.log("(e.g., techcorp, designhub, acmecorp) for tenant management.");

    await pool.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createSystemTenant();
