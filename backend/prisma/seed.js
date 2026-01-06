// Prisma Seed Script - Hashes passwords consistently using bcrypt
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await prisma.auditLog.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();

    // Hash passwords (consistent at seed time)
    const superAdminHash = await bcrypt.hash("Admin@123", 10);
    const adminHash = await bcrypt.hash("Demo@123", 10);
    const userHash = await bcrypt.hash("User@123", 10);

    console.log("✅ Password hashes generated:");
    console.log(`   Super Admin: ${superAdminHash}`);
    console.log(`   Admin: ${adminHash}`);
    console.log(`   User: ${userHash}`);

    // Create Demo Tenant
    console.log("\n📦 Creating tenant...");
    const demoTenant = await prisma.tenant.create({
      data: {
        name: "Demo Company",
        subdomain: "demo",
        status: "active",
        subscriptionPlan: "pro",
        maxProjects: 15,
        maxUsers: 25,
      },
    });
    console.log(`✅ Created tenant: ${demoTenant.name}`);

    // Create Super Admin (no tenant)
    console.log("\n👤 Creating super admin...");
    const superAdmin = await prisma.user.create({
      data: {
        email: "superadmin@system.com",
        passwordHash: superAdminHash,
        fullName: "Super Admin",
        role: "super_admin",
        tenantId: null,
      },
    });
    console.log(`✅ Created super admin: ${superAdmin.email}`);

    // Create Demo Admin
    console.log("\n👤 Creating demo admin...");
    const demoAdmin = await prisma.user.create({
      data: {
        email: "admin@demo.com",
        passwordHash: adminHash,
        fullName: "Demo Admin",
        role: "tenant_admin",
        tenantId: demoTenant.id,
      },
    });
    console.log(`✅ Created demo admin: ${demoAdmin.email}`);

    // Create Demo Users
    console.log("\n👥 Creating demo users...");
    const user1 = await prisma.user.create({
      data: {
        email: "user1@demo.com",
        passwordHash: userHash,
        fullName: "Demo User One",
        role: "user",
        tenantId: demoTenant.id,
      },
    });
    const user2 = await prisma.user.create({
      data: {
        email: "user2@demo.com",
        passwordHash: userHash,
        fullName: "Demo User Two",
        role: "user",
        tenantId: demoTenant.id,
      },
    });
    console.log(`✅ Created user: ${user1.email}`);
    console.log(`✅ Created user: ${user2.email}`);

    // Create Demo Projects
    console.log("\n📋 Creating demo projects...");
    const project1 = await prisma.project.create({
      data: {
        tenantId: demoTenant.id,
        name: "Project Alpha",
        description: "First demo project",
        status: "active",
        createdBy: demoAdmin.id,
      },
    });
    const project2 = await prisma.project.create({
      data: {
        tenantId: demoTenant.id,
        name: "Project Beta",
        description: "Second demo project",
        status: "active",
        createdBy: demoAdmin.id,
      },
    });
    console.log(`✅ Created project: ${project1.name}`);
    console.log(`✅ Created project: ${project2.name}`);

    // Create Demo Tasks
    console.log("\n✓ Creating demo tasks...");
    const task1 = await prisma.task.create({
      data: {
        projectId: project1.id,
        title: "Setup authentication",
        description: "Implement user authentication system",
        status: "completed",
        assignedTo: user1.id,
      },
    });
    const task2 = await prisma.task.create({
      data: {
        projectId: project1.id,
        title: "Design database schema",
        description: "Design and optimize database schema",
        status: "in_progress",
        assignedTo: user2.id,
      },
    });
    const task3 = await prisma.task.create({
      data: {
        projectId: project1.id,
        title: "Implement API endpoints",
        description: "Build REST API endpoints",
        status: "todo",
        assignedTo: user1.id,
      },
    });
    console.log(`✅ Created task: ${task1.title}`);
    console.log(`✅ Created task: ${task2.title}`);
    console.log(`✅ Created task: ${task3.title}`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📝 Test Credentials:");
    console.log("   Super Admin: superadmin@system.com / Admin@123");
    console.log("   Demo Admin: admin@demo.com / Demo@123");
    console.log("   Demo User: user1@demo.com or user2@demo.com / User@123");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
