const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function fixSuperAdminPassword() {
  try {
    console.log("🔧 Fixing super admin password...");

    const password = "Admin@123";
    const passwordHash = await bcrypt.hash(password, 10);

    console.log("New hash:", passwordHash);

    const result = await pool.query(
      `UPDATE users 
       SET password_hash = $1 
       WHERE email = 'superadmin@system.com' AND tenant_id IS NULL`,
      [passwordHash]
    );

    if (result.rowCount > 0) {
      console.log("✅ Super admin password updated successfully!");
      console.log("📧 Email: superadmin@system.com");
      console.log("🔑 Password: Admin@123");
    } else {
      console.log("❌ No super admin found to update");
    }

    await pool.end();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

fixSuperAdminPassword();
