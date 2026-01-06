// Seed Script for Multi-Tenant SaaS Platform
// Uses same bcrypt hashing as registration API
// Runs AFTER SQL migrations are complete

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const SALT_ROUNDS = 10;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log("🌱 Starting database seed...\n");

    // Start transaction
    await client.query("BEGIN");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await client.query("DELETE FROM audit_logs");
    await client.query("DELETE FROM tasks");
    await client.query("DELETE FROM projects");
    await client.query("DELETE FROM users");
    await client.query("DELETE FROM tenants");
    console.log("✅ Data cleared\n");

    // Reset sequences
    console.log("🔄 Resetting sequences...");
    await client.query("ALTER SEQUENCE tenants_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE projects_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE tasks_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1");
    console.log("✅ Sequences reset\n");

    // Hash passwords using same method as registration API
    console.log("🔐 Generating password hashes...");
    const superAdminHash = await hashPassword("Admin@123");
    const adminHash = await hashPassword("Demo@123");
    const userHash = await hashPassword("User@123");
    console.log("✅ Passwords hashed\n");

    // Create Demo Tenant
    console.log("📦 Creating demo tenant...");
    const tenantResult = await client.query(
      `INSERT INTO tenants (name, subdomain, status, subscription_plan, max_projects, max_users)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, subdomain`,
      ["Demo Company", "demo", "active", "pro", 15, 25]
    );
    const tenantId = tenantResult.rows[0].id;
    console.log(
      `✅ Created tenant: ${tenantResult.rows[0].name} (${tenantResult.rows[0].subdomain})\n`
    );

    // Create Super Admin (no tenant)
    console.log("👤 Creating super admin...");
    const superAdminResult = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email`,
      [
        null,
        "superadmin@system.com",
        superAdminHash,
        "Super Admin",
        "super_admin",
      ]
    );
    const superAdminId = superAdminResult.rows[0].id;
    console.log(`✅ Created super admin: ${superAdminResult.rows[0].email}\n`);

    // Create Demo Admin
    console.log("👤 Creating demo tenant admin...");
    const adminResult = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email`,
      [tenantId, "admin@demo.com", adminHash, "Demo Admin", "tenant_admin"]
    );
    const adminId = adminResult.rows[0].id;
    console.log(`✅ Created admin: ${adminResult.rows[0].email}\n`);

    // Create Demo Users
    console.log("👥 Creating demo users...");
    const user1Result = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email`,
      [tenantId, "user1@demo.com", userHash, "Demo User One", "user"]
    );
    const user1Id = user1Result.rows[0].id;
    console.log(`✅ Created user: ${user1Result.rows[0].email}`);

    const user2Result = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email`,
      [tenantId, "user2@demo.com", userHash, "Demo User Two", "user"]
    );
    const user2Id = user2Result.rows[0].id;
    console.log(`✅ Created user: ${user2Result.rows[0].email}\n`);

    // Create Demo Projects
    console.log("📋 Creating demo projects...");
    const project1Result = await client.query(
      `INSERT INTO projects (tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name`,
      [tenantId, "Project Alpha", "First demo project", "active", adminId]
    );
    const project1Id = project1Result.rows[0].id;
    console.log(`✅ Created project: ${project1Result.rows[0].name}`);

    const project2Result = await client.query(
      `INSERT INTO projects (tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name`,
      [tenantId, "Project Beta", "Second demo project", "active", adminId]
    );
    const project2Id = project2Result.rows[0].id;
    console.log(`✅ Created project: ${project2Result.rows[0].name}\n`);

    // Create Demo Tasks
    console.log("✅ Creating demo tasks...");
    const tasks = [
      { projectId: project1Id, title: "Design mockup", status: "todo" },
      {
        projectId: project1Id,
        title: "Create wireframes",
        status: "in_progress",
      },
      { projectId: project1Id, title: "Code frontend", status: "todo" },
      { projectId: project2Id, title: "Setup database", status: "completed" },
      { projectId: project2Id, title: "Configure API", status: "in_progress" },
    ];

    for (const task of tasks) {
      await client.query(
        `INSERT INTO tasks (tenant_id, project_id, title, status, assigned_to, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [tenantId, task.projectId, task.title, task.status, user1Id, adminId]
      );
    }
    console.log(`✅ Created ${tasks.length} demo tasks\n`);

    // Commit transaction
    await client.query("COMMIT");

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✨ Database seeding completed successfully!\n");
    console.log("📝 Test Credentials:");
    console.log("   Super Admin: superadmin@system.com / Admin@123");
    console.log("   Demo Admin:  admin@demo.com / Demo@123");
    console.log("   Demo User:   user1@demo.com / User@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seed
seedDatabase();
