const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function testLogin() {
  try {
    const user = await pool.query(
      "SELECT password_hash FROM users WHERE email='admin@techcorp.com'"
    );

    const storedHash = user.rows[0]?.password_hash;
    const testPassword = "password123";

    console.log("\nStored Hash:", storedHash);
    console.log("Test Password:", testPassword);

    const isValid = await bcrypt.compare(testPassword, storedHash);
    console.log("\n✅ Password Match:", isValid);

    // Test hash generation
    const testHash = await bcrypt.hash(testPassword, 10);
    console.log("\nNew Hash Test:", testHash);
    const testMatch = await bcrypt.compare(testPassword, testHash);
    console.log("New Hash Match:", testMatch);

    await pool.end();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

testLogin();
