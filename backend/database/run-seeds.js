// Database Seed Runner
// Runs seed data SQL file

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
});

const runSeeds = async () => {
  try {
    console.log("==============================================");
    console.log("🌱 Starting database seeding...");
    console.log("==============================================\n");

    const seedsPath = path.join(__dirname, "seeds");
    const seedFiles = fs
      .readdirSync(seedsPath)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of seedFiles) {
      console.log(`⏳ Running seed: ${file}`);
      const filePath = path.join(seedsPath, file);
      const sql = fs.readFileSync(filePath, "utf8");

      await pool.query(sql);
      console.log(`✅ Completed: ${file}\n`);
    }

    console.log("==============================================");
    console.log("✅ All seeds completed successfully!");
    console.log("==============================================");
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runSeeds();
