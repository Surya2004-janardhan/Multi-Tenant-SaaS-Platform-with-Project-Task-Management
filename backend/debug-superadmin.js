const axios = require("axios");

async function testSuperAdminLogin() {
  try {
    console.log("Testing super admin login...");
    console.log("Email: superadmin@system.com");
    console.log("Password: Admin@123");
    console.log("Subdomain: techcorp");

    const response = await axios.post("http://localhost:5000/api/auth/login", {
      email: "superadmin@system.com",
      password: "Admin@123",
      tenantSubdomain: "techcorp",
    });

    console.log("\n✅ Login successful!");
    console.log("Token:", response.data.data.token);
    console.log("User:", JSON.stringify(response.data.data.user, null, 2));
  } catch (error) {
    console.log("\n❌ Login failed!");
    console.log("Status:", error.response?.status);
    console.log("Response:", JSON.stringify(error.response?.data, null, 2));

    // Try to debug by checking database
    const { Pool } = require("pg");
    require("dotenv").config();

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    const result = await pool.query(
      "SELECT email, role, tenant_id, LENGTH(password_hash) as hash_length FROM users WHERE email = 'superadmin@system.com'"
    );

    console.log("\nDatabase check:");
    console.log(result.rows);

    await pool.end();
  }
}

testSuperAdminLogin();
