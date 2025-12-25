const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function verifySuperAdmin() {
  try {
    console.log("🔍 Verifying Super Admin Configuration\n");

    // Check super admin in database
    const result = await pool.query(
      "SELECT id, email, role, tenant_id, full_name FROM users WHERE email = 'superadmin@system.com'"
    );

    if (result.rows.length === 0) {
      console.log("❌ Super admin not found!");
      await pool.end();
      return;
    }

    const superAdmin = result.rows[0];
    console.log("📋 Super Admin Details:");
    console.log("━".repeat(60));
    console.log("ID:        ", superAdmin.id);
    console.log("Email:     ", superAdmin.email);
    console.log("Name:      ", superAdmin.full_name);
    console.log("Role:      ", superAdmin.role);
    console.log("Tenant ID: ", superAdmin.tenant_id);
    console.log("━".repeat(60));

    // Verify tenant_id is NULL
    if (superAdmin.tenant_id === null) {
      console.log("\n✅ CORRECT: tenant_id is NULL (as per requirements)");
      console.log("✅ Super admin is NOT bound to any specific tenant");
    } else {
      console.log(
        "\n❌ ERROR: tenant_id should be NULL but is:",
        superAdmin.tenant_id
      );
    }

    // Test login with different subdomains
    const axios = require("axios");
    const testSubdomains = ["system", "techcorp", "designhub", "acmecorp"];

    console.log("\n🧪 Testing Super Admin Login with Different Subdomains:");
    console.log("━".repeat(60));

    for (const subdomain of testSubdomains) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/login",
          {
            email: "superadmin@system.com",
            password: "Admin@123",
            tenantSubdomain: subdomain,
          }
        );

        const tokenTenantId = response.data.data.user.tenantId;
        console.log(`✅ Subdomain "${subdomain}": Login SUCCESS`);
        console.log(
          `   Token tenant_id: ${
            tokenTenantId === null ? "NULL (correct)" : tokenTenantId
          }`
        );
      } catch (error) {
        console.log(`❌ Subdomain "${subdomain}": Login FAILED`);
        console.log(
          `   Error: ${error.response?.data?.message || error.message}`
        );
      }
    }

    console.log("\n📝 Summary:");
    console.log("━".repeat(60));
    console.log("Requirement: Super admin tenant_id must be NULL");
    console.log(
      "Status:      ",
      superAdmin.tenant_id === null ? "✅ VERIFIED" : "❌ FAILED"
    );
    console.log("\nRequirement: Super admin can login with ANY subdomain");
    console.log("Status:      Testing above...");

    await pool.end();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

verifySuperAdmin();
