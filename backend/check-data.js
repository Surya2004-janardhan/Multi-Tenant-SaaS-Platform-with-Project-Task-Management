const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});

async function checkData() {
  try {
    const tenants = await pool.query("SELECT * FROM tenants");
    console.log("\n✅ Tenants:", tenants.rows.length);
    tenants.rows.forEach(t => console.log(`   - ${t.name} (${t.subdomain})`));
    
    const users = await pool.query("SELECT email, full_name, role FROM users");
    console.log("\n✅ Users:", users.rows.length);
    users.rows.forEach(u => console.log(`   - ${u.email} [${u.role}]`));
    
    const admin = await pool.query("SELECT * FROM users WHERE email='admin@techcorp.com'");
    console.log("\n✅ TechCorp Admin:", admin.rows[0]?.email || "NOT FOUND");
    if (admin.rows[0]) {
      console.log("   Password hash exists:", admin.rows[0].password_hash ? "YES" : "NO");
    }
    
    await pool.end();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkData();
