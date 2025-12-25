# Super Admin Permissions & Restrictions

## Super Admin Configuration
- **Email:** `superadmin@system.com`
- **Password:** `Admin@123`
- **tenant_id:** `NULL` (not bound to any tenant)
- **Role:** `super_admin`

## Login Subdomains
Super admin can login with **ANY tenant subdomain**:
- `system` - Dedicated system subdomain
- `techcorp` - To view/manage TechCorp data
- `designhub` - To view/manage DesignHub data
- `acmecorp` - To view/manage AcmeCorp data
- Any other tenant subdomain

## Permissions (What Super Admin CAN Do)

### ✅ Tenant Management (Super Admin ONLY)
1. **List All Tenants** - `GET /api/tenants`
2. **Get Tenant Details** - `GET /api/tenants/:id`
3. **Update Tenant** - `PUT /api/tenants/:id`
   - Change subscription plans
   - Update tenant settings
   - Modify limits

### ✅ View/Read Operations (All Tenants)
Super admin can VIEW data from any tenant:
- **List Users** - `GET /api/users` (any tenant)
- **Get User** - `GET /api/users/:id` (any tenant)
- **List Projects** - `GET /api/projects` (any tenant)
- **Get Project** - `GET /api/projects/:id` (any tenant)
- **List Tasks** - `GET /api/tasks` (any tenant)
- **Get Task** - `GET /api/tasks/:id` (any tenant)

### ✅ Update/Delete Operations (All Tenants)
Super admin can MODIFY data from any tenant:
- **Update User** - `PUT /api/users/:id`
- **Delete User** - `DELETE /api/users/:id`
- **Update Project** - `PUT /api/projects/:id`
- **Delete Project** - `DELETE /api/projects/:id`
- **Update Task** - `PUT /api/tasks/:id`
- **Update Task Status** - `PATCH /api/tasks/:id/status`
- **Delete Task** - `DELETE /api/tasks/:id`

## Restrictions (What Super Admin CANNOT Do)

### ❌ Create Operations
Super admin **CANNOT** create new resources because they don't belong to any tenant (`tenant_id = NULL`):

1. **Cannot Create Users** - `POST /api/users`
   - Error: "Super admin cannot create users. Please login as a tenant admin to create users."
   - **Reason:** Users must belong to a tenant

2. **Cannot Create Projects** - `POST /api/projects`
   - Error: "Super admin cannot create projects. Please login as a tenant admin or user to create projects."
   - **Reason:** Projects must belong to a tenant

3. **Cannot Create Tasks** - `POST /api/tasks`
   - Error: "Super admin cannot create tasks. Please login as a tenant admin or user to create tasks."
   - **Reason:** Tasks must belong to a tenant and project

4. **Cannot Register New Tenants** - `POST /api/auth/register`
   - This is for public tenant registration only
   - Super admin should use tenant management endpoints instead

## Use Cases

### Scenario 1: View All Tenants
```javascript
// Login as super admin
POST /api/auth/login
{
  "email": "superadmin@system.com",
  "password": "Admin@123",
  "tenantSubdomain": "system"
}

// List all tenants
GET /api/tenants
Authorization: Bearer {token}
```

### Scenario 2: Manage TechCorp Users
```javascript
// Login with TechCorp subdomain
POST /api/auth/login
{
  "email": "superadmin@system.com",
  "password": "Admin@123",
  "tenantSubdomain": "techcorp"
}

// View TechCorp users
GET /api/users
Authorization: Bearer {token}

// Update a user
PUT /api/users/5
Authorization: Bearer {token}
{
  "fullName": "Updated Name"
}

// Delete a user
DELETE /api/users/5
Authorization: Bearer {token}
```

### Scenario 3: Update Tenant Subscription
```javascript
// Login as super admin
POST /api/auth/login
{
  "email": "superadmin@system.com",
  "password": "Admin@123",
  "tenantSubdomain": "system"
}

// Upgrade tenant to enterprise plan
PUT /api/tenants/1
Authorization: Bearer {token}
{
  "subscription_plan": "enterprise",
  "max_users": 100,
  "max_projects": 50
}
```

### Scenario 4: What Super Admin CANNOT Do
```javascript
// ❌ Cannot create a project (will fail with 403)
POST /api/projects
Authorization: Bearer {super_admin_token}
{
  "name": "New Project"
}
// Response: 403 Forbidden
// "Super admin cannot create projects. Please login as a tenant admin or user to create projects."

// ✅ Solution: Login as tenant admin instead
POST /api/auth/login
{
  "email": "admin@techcorp.com",
  "password": "password123",
  "tenantSubdomain": "techcorp"
}
// Now can create projects
```

## Design Rationale

### Why Super Admin Cannot Create Resources?

1. **Data Integrity:** All projects, tasks, and users must belong to a tenant
2. **Tenant Isolation:** Resources must be associated with a specific tenant for proper isolation
3. **Subscription Limits:** Creation operations check subscription limits, which require a valid tenant
4. **Audit Trail:** All creation operations log the tenant_id for proper audit trails

### Super Admin's Role

Super admin is designed for **system administration**, not **tenant operations**:
- **Monitor** all tenants
- **Manage** tenant settings and subscriptions
- **View/Edit/Delete** existing tenant data
- **Support** tenant admins with data corrections

For creating resources within a tenant, login as:
- **Tenant Admin** - Can create users, projects, tasks
- **Regular User** - Can create projects and tasks (with permissions)

## Permission Matrix

| Action | Super Admin | Tenant Admin | User |
|--------|-------------|--------------|------|
| List All Tenants | ✅ | ❌ | ❌ |
| View Tenant Details | ✅ | ❌ | ❌ |
| Update Tenant | ✅ | ❌ | ❌ |
| Create User | ❌ | ✅ | ❌ |
| List Users | ✅ | ✅ | ✅ |
| Update User | ✅ | ✅ | ❌ |
| Delete User | ✅ | ✅ | ❌ |
| Create Project | ❌ | ✅ | ✅ |
| List Projects | ✅ | ✅ | ✅ |
| Update Project | ✅ | ✅ | ✅ |
| Delete Project | ✅ | ✅ | ✅ |
| Create Task | ❌ | ✅ | ✅ |
| List Tasks | ✅ | ✅ | ✅ |
| Update Task | ✅ | ✅ | ✅ |
| Delete Task | ✅ | ✅ | ✅ |

## Summary

✅ **Super Admin CAN:**
- View and manage all tenants
- View, update, and delete any tenant's data
- Update subscription plans and limits
- Login with any tenant subdomain

❌ **Super Admin CANNOT:**
- Create users, projects, or tasks
- Register new tenants (use tenant management endpoints)

**Why:** Super admin has `tenant_id = NULL` and is designed for system-wide administration, not tenant-specific operations.
