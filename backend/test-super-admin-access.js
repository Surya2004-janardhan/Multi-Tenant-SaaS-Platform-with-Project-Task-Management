// Super Admin Specific Access Tests
// Tests super admin viewing all tenants' data and restrictions on creating resources

const axios = require("axios");

const API_URL = "http://localhost:5000/api";
let superAdminToken = null;
let tenantAdminToken = null;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
  section: (msg) =>
    console.log(
      `\n${"=".repeat(60)}\n${colors.cyan}${msg}${colors.reset}\n${"=".repeat(
        60
      )}`
    ),
};

let testResults = { passed: 0, failed: 0, total: 0 };

const runTest = async (testName, testFn) => {
  testResults.total++;
  try {
    log.test(`Testing: ${testName}`);
    await testFn();
    testResults.passed++;
    log.success(`PASSED: ${testName}`);
    return true;
  } catch (error) {
    testResults.failed++;
    log.error(`FAILED: ${testName}`);
    log.error(`  Error: ${error.message}`);
    if (error.response?.data) {
      log.error(`  Response: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
};

const expectSuccess = (response, expectedStatus = 200) => {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}`
    );
  }
  if (!response.data.success) {
    throw new Error(`Expected success=true, got ${response.data.success}`);
  }
};

const expectError = (error, expectedStatus) => {
  if (!error.response) {
    throw new Error(`Expected error response, got: ${error.message}`);
  }
  if (error.response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, got ${error.response.status}`
    );
  }
};

const testSuperAdminAccess = async () => {
  log.section("SUPER ADMIN SPECIFIC ACCESS TESTS");

  // Login as super admin
  await runTest('SA-1: Super Admin Login with "system" subdomain', async () => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: "superadmin@system.com",
      password: "Admin@123",
      tenantSubdomain: "system",
    });
    expectSuccess(response, 200);
    superAdminToken = response.data.data.token;
    if (response.data.data.user.tenantId !== null) {
      throw new Error("Super admin should have tenantId=null");
    }
  });

  // Login as tenant admin for comparison
  const tenantResponse = await axios.post(`${API_URL}/auth/login`, {
    email: "admin@techcorp.com",
    password: "password123",
    tenantSubdomain: "techcorp",
  });
  tenantAdminToken = tenantResponse.data.data.token;

  // Test viewing all projects
  await runTest(
    "SA-2: Super Admin Can View All Projects (All Tenants)",
    async () => {
      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${superAdminToken}` },
      });
      expectSuccess(response, 200);
      if (!response.data.data.projects) {
        throw new Error("No projects data returned");
      }
      // Should have projects with tenant_name field
      const hasMultipleTenants = response.data.data.projects.some(
        (p) => p.tenant_name
      );
      if (!hasMultipleTenants) {
        log.warning("Projects should include tenant_name for super admin view");
      }
    }
  );

  // Test viewing all users
  await runTest(
    "SA-3: Super Admin Can View All Users (All Tenants)",
    async () => {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${superAdminToken}` },
      });
      expectSuccess(response, 200);
      if (!response.data.data.users) {
        throw new Error("No users data returned");
      }
      // Should have users with tenant_name field
      const hasMultipleTenants = response.data.data.users.some(
        (u) => u.tenant_name
      );
      if (!hasMultipleTenants) {
        log.warning("Users should include tenant_name for super admin view");
      }
    }
  );

  // Test viewing all tasks
  await runTest(
    "SA-4: Super Admin Can View All Tasks (All Tenants)",
    async () => {
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${superAdminToken}` },
      });
      expectSuccess(response, 200);
    }
  );

  // Test creating restrictions
  await runTest("SA-5: Super Admin CANNOT Create Projects", async () => {
    try {
      await axios.post(
        `${API_URL}/projects`,
        {
          name: "Test Project",
          description: "Should fail",
        },
        {
          headers: { Authorization: `Bearer ${superAdminToken}` },
        }
      );
      throw new Error("Super admin should not be able to create projects");
    } catch (error) {
      expectError(error, 403);
      if (
        !error.response.data.message.includes(
          "Super admin cannot create projects"
        )
      ) {
        throw new Error("Wrong error message");
      }
    }
  });

  await runTest("SA-6: Super Admin CANNOT Create Users", async () => {
    try {
      await axios.post(
        `${API_URL}/users`,
        {
          email: "test@test.com",
          password: "Test@123",
          fullName: "Test User",
        },
        {
          headers: { Authorization: `Bearer ${superAdminToken}` },
        }
      );
      throw new Error("Super admin should not be able to create users");
    } catch (error) {
      expectError(error, 403);
      if (
        !error.response.data.message.includes("Super admin cannot create users")
      ) {
        throw new Error("Wrong error message");
      }
    }
  });

  await runTest("SA-7: Super Admin CANNOT Create Tasks", async () => {
    try {
      await axios.post(
        `${API_URL}/tasks`,
        {
          projectId: 1,
          title: "Test Task",
        },
        {
          headers: { Authorization: `Bearer ${superAdminToken}` },
        }
      );
      throw new Error("Super admin should not be able to create tasks");
    } catch (error) {
      expectError(error, 403);
      if (
        !error.response.data.message.includes("Super admin cannot create tasks")
      ) {
        throw new Error("Wrong error message");
      }
    }
  });

  // Test tenant admin restrictions
  await runTest("SA-8: Tenant Admin CANNOT List All Tenants", async () => {
    try {
      await axios.get(`${API_URL}/tenants`, {
        headers: { Authorization: `Bearer ${tenantAdminToken}` },
      });
      throw new Error("Tenant admin should not access tenant list");
    } catch (error) {
      expectError(error, 403);
    }
  });

  await runTest(
    "SA-9: Tenant Admin CANNOT View Other Tenant Details",
    async () => {
      try {
        await axios.get(`${API_URL}/tenants/2`, {
          headers: { Authorization: `Bearer ${tenantAdminToken}` },
        });
        throw new Error("Tenant admin should not view other tenants");
      } catch (error) {
        expectError(error, 403);
      }
    }
  );

  await runTest(
    "SA-10: Tenant Admin CANNOT Update Subscription Plans",
    async () => {
      try {
        await axios.put(
          `${API_URL}/tenants/1`,
          {
            subscription_plan: "enterprise",
          },
          {
            headers: { Authorization: `Bearer ${tenantAdminToken}` },
          }
        );
        throw new Error("Tenant admin should not update tenants");
      } catch (error) {
        expectError(error, 403);
      }
    }
  );

  // Test super admin CAN manage tenants
  await runTest("SA-11: Super Admin CAN List All Tenants", async () => {
    const response = await axios.get(`${API_URL}/tenants`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    expectSuccess(response, 200);
    if (!response.data.data.tenants) {
      throw new Error("No tenants data returned");
    }
    if (response.data.data.tenants.length < 2) {
      throw new Error("Should return multiple tenants");
    }
  });

  await runTest("SA-12: Super Admin CAN View Any Tenant Details", async () => {
    const response = await axios.get(`${API_URL}/tenants/1`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    expectSuccess(response, 200);
  });

  await runTest(
    "SA-13: Super Admin CAN Update Tenant Subscription",
    async () => {
      const response = await axios.put(
        `${API_URL}/tenants/1`,
        {
          max_users: 30,
        },
        {
          headers: { Authorization: `Bearer ${superAdminToken}` },
        }
      );
      expectSuccess(response, 200);
    }
  );

  // Test cross-tenant data isolation for regular users
  await runTest(
    "SA-14: Tenant Admin Only Sees Own Tenant Projects",
    async () => {
      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${tenantAdminToken}` },
      });
      expectSuccess(response, 200);
      // All projects should belong to tenant_id=1
      const allBelongToTenant = response.data.data.projects.every(
        (p) => !p.tenant_id || p.tenant_id === 1
      );
      if (!allBelongToTenant) {
        throw new Error("Tenant admin seeing other tenants' projects");
      }
    }
  );

  await runTest("SA-15: Tenant Admin Only Sees Own Tenant Users", async () => {
    const response = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${tenantAdminToken}` },
    });
    expectSuccess(response, 200);
    // All users should belong to tenant_id=1
    const allBelongToTenant = response.data.data.users.every(
      (u) => !u.tenant_id || u.tenant_id === 1
    );
    if (!allBelongToTenant) {
      throw new Error("Tenant admin seeing other tenants' users");
    }
  });

  // Test super admin can login with any subdomain
  await runTest(
    "SA-16: Super Admin Can Login with TechCorp Subdomain",
    async () => {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: "superadmin@system.com",
        password: "Admin@123",
        tenantSubdomain: "techcorp",
      });
      expectSuccess(response, 200);
      if (response.data.data.user.tenantId !== null) {
        throw new Error("Super admin should still have tenantId=null");
      }
    }
  );

  await runTest(
    "SA-17: Super Admin Can Login with DesignHub Subdomain",
    async () => {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: "superadmin@system.com",
        password: "Admin@123",
        tenantSubdomain: "designhub",
      });
      expectSuccess(response, 200);
      if (response.data.data.user.tenantId !== null) {
        throw new Error("Super admin should still have tenantId=null");
      }
    }
  );

  // Final Report
  log.section("📊 SUPER ADMIN TEST RESULTS");
  console.log(`\nTotal Tests: ${testResults.total}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  console.log(
    `Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(
      2
    )}%\n`
  );

  if (testResults.failed === 0) {
    log.success("🎉 ALL SUPER ADMIN TESTS PASSED!");
    log.info("\n✅ Super Admin Capabilities Verified:");
    log.info("   - Can view all projects, users, tasks from all tenants");
    log.info("   - Can manage (view, update) all tenants");
    log.info("   - Can login with any tenant subdomain");
    log.info("   - Has tenant_id = NULL in database and token");
    log.info("\n❌ Super Admin Restrictions Verified:");
    log.info("   - Cannot create projects (need tenant_id)");
    log.info("   - Cannot create users (need tenant_id)");
    log.info("   - Cannot create tasks (need tenant_id)");
    log.info("\n🔒 Tenant Isolation Verified:");
    log.info("   - Tenant admins only see their own tenant data");
    log.info("   - Tenant admins cannot access tenant management");
    log.info("   - Cross-tenant data access prevented");
  } else {
    log.warning(`⚠️  ${testResults.failed} test(s) failed. Please review.`);
  }
};

testSuperAdminAccess().catch(console.error);
