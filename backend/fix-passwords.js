const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function fixPasswords() {
  try {
    const hash = await bcrypt.hash("password123", 10);
    console.log("\n🔄 Updating all user passwords to 'password123'...");

    await pool.query("UPDATE users SET password_hash = $1", [hash]);

    console.log("✅ All passwords updated successfully!");
    console.log("\n📝 Test Credentials:");
    console.log("   Password: password123");
    console.log("   Tenants: techcorp, designhub, acmecorp");

    const users = await pool.query("SELECT email FROM users");
    console.log("\n✅ Updated Users:");
    users.rows.forEach((u) => console.log(`   - ${u.email}`));

    await pool.end();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

fixPasswords();
