# Architecture Document

**Project:** Multi-Tenant SaaS Platform with Project & Task Management  
**Version:** 1.0  
**Date:** December 22, 2025  
**Architects:** Development Team

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Database Schema Design](#database-schema-design)
3. [API Architecture](#api-architecture)
4. [Security Architecture](#security-architecture)
5. [Deployment Architecture](#deployment-architecture)

---

## System Architecture Overview

### High-Level Architecture

Our platform follows a classic three-tier architecture with a modern twist for multi-tenancy:

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Browser    │  │   Mobile     │  │   Tablet     │       │
│  │  (Desktop)   │  │   Browser    │  │   Browser    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                           │                                  │
│                      HTTPS (TLS)                            │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                  Application Layer                           │
│                           │                                  │
│              ┌────────────▼────────────┐                     │
│              │   React Frontend App    │                     │
│              │   - React Router        │                     │
│              │   - State Management    │                     │
│              │   - API Service Layer   │                     │
│              └────────────┬────────────┘                     │
│                           │                                  │
│                      REST API (JSON)                        │
│                           │                                  │
│              ┌────────────▼────────────┐                     │
│              │   Express.js Backend    │                     │
│              │   ┌──────────────────┐  │                     │
│              │   │  Auth Middleware │  │                     │
│              │   │  Tenant Context  │  │                     │
│              │   └──────────────────┘  │                     │
│              │   ┌──────────────────┐  │                     │
│              │   │   Controllers    │  │                     │
│              │   └──────────────────┘  │                     │
│              │   ┌──────────────────┐  │                     │
│              │   │    Services      │  │                     │
│              │   └──────────────────┘  │                     │
│              └────────────┬────────────┘                     │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                    Data Layer                                │
│              ┌────────────▼────────────┐                     │
│              │   PostgreSQL Database   │                     │
│              │   ┌──────────────────┐  │                     │
│              │   │  Multi-Tenant    │  │                     │
│              │   │  Shared Schema   │  │                     │
│              │   └──────────────────┘  │                     │
│              │   - Tenants            │                      │
│              │   - Users              │                      │
│              │   - Projects           │                      │
│              │   - Tasks              │                      │
│              │   - Audit Logs         │                      │
│              └─────────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │ Backend │                │ Database │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │  POST /api/auth/login    │                          │
     │  {email, password,       │                          │
     │   subdomain}             │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │  SELECT tenant           │
     │                          │  WHERE subdomain = ?     │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │  Tenant record           │
     │                          │<─────────────────────────┤
     │                          │                          │
     │                          │  SELECT user             │
     │                          │  WHERE tenant_id = ?     │
     │                          │  AND email = ?           │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │  User record             │
     │                          │<─────────────────────────┤
     │                          │                          │
     │                          │  bcrypt.compare()        │
     │                          │  (verify password)       │
     │                          │                          │
     │                          │  jwt.sign()              │
     │                          │  (generate token)        │
     │                          │                          │
     │                          │  INSERT audit_log        │
     │                          ├─────────────────────────>│
     │                          │                          │
     │  200 OK                  │                          │
     │  {user, token}           │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │  Store token in          │                          │
     │  localStorage            │                          │
     │                          │                          │
```

### Request Flow with Tenant Isolation

```
┌─────────┐                ┌─────────────┐              ┌──────────┐
│ Client  │                │   Backend   │              │ Database │
└────┬────┘                └──────┬──────┘              └────┬─────┘
     │                            │                          │
     │  GET /api/projects         │                          │
     │  Authorization: Bearer JWT │                          │
     ├───────────────────────────>│                          │
     │                            │                          │
     │                            │  Extract & Verify JWT    │
     │                            │  {userId, tenantId,      │
     │                            │   role}                  │
     │                            │                          │
     │                            │  Inject tenant context   │
     │                            │  req.user.tenantId       │
     │                            │                          │
     │                            │  SELECT projects         │
     │                            │  WHERE tenant_id = ?     │
     │                            │  (automatic filtering)   │
     │                            ├─────────────────────────>│
     │                            │                          │
     │                            │  Projects for tenant     │
     │                            │<─────────────────────────┤
     │                            │                          │
     │  200 OK                    │                          │
     │  {projects: [...]}         │                          │
     │<───────────────────────────┤                          │
     │                            │                          │
```

### Component Architecture

**Frontend Components Hierarchy:**

```
App
├── AuthProvider (Context)
│   └── User State Management
│
├── PrivateRoute (Auth Guard)
│   ├── Login Page
│   └── Register Page
│
└── MainLayout
    ├── Navbar
    │   ├── Logo
    │   ├── Navigation Menu
    │   └── User Dropdown
    │
    ├── Sidebar (optional)
    │
    └── Routes
        ├── Dashboard
        │   ├── StatsCards
        │   ├── RecentProjects
        │   └── MyTasks
        │
        ├── Projects
        │   ├── ProjectList
        │   │   └── ProjectCard
        │   └── CreateProjectModal
        │
        ├── ProjectDetails
        │   ├── ProjectHeader
        │   ├── TaskList
        │   │   └── TaskItem
        │   ├── CreateTaskModal
        │   └── EditTaskModal
        │
        └── Users (Admin Only)
            ├── UserTable
            ├── AddUserModal
            └── EditUserModal
```

**Backend Module Architecture:**

```
src/
├── config/
│   ├── database.js        # PostgreSQL connection
│   └── jwt.js             # JWT secret & options
│
├── middleware/
│   ├── auth.js            # Verify JWT token
│   ├── authorize.js       # Check user roles
│   ├── tenantContext.js   # Inject tenant_id
│   └── errorHandler.js    # Global error handling
│
├── controllers/
│   ├── authController.js      # Login, register, logout
│   ├── tenantController.js    # Tenant CRUD
│   ├── userController.js      # User management
│   ├── projectController.js   # Project CRUD
│   └── taskController.js      # Task CRUD
│
├── services/
│   ├── auditService.js    # Audit logging
│   ├── hashService.js     # Password hashing
│   └── tokenService.js    # JWT generation
│
├── models/
│   ├── tenantModel.js     # Tenant queries
│   ├── userModel.js       # User queries
│   ├── projectModel.js    # Project queries
│   └── taskModel.js       # Task queries
│
├── routes/
│   ├── authRoutes.js
│   ├── tenantRoutes.js
│   ├── userRoutes.js
│   ├── projectRoutes.js
│   └── taskRoutes.js
│
├── utils/
│   ├── validation.js      # Input validators
│   └── helpers.js         # Utility functions
│
└── index.js               # App entry point
```

---

## Database Schema Design

### Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────┐
│                         TENANTS                             │
├──────────────────┬──────────────────────────────────────────┤
│ PK  id           │ VARCHAR(UUID)                            │
│     name         │ VARCHAR(255) NOT NULL                    │
│ UK  subdomain    │ VARCHAR(63) UNIQUE NOT NULL              │
│     status       │ ENUM('active','suspended','trial')       │
│     subscription │ ENUM('free','pro','enterprise')          │
│     max_users    │ INTEGER DEFAULT 5                        │
│     max_projects │ INTEGER DEFAULT 3                        │
│     created_at   │ TIMESTAMP DEFAULT NOW()                  │
│     updated_at   │ TIMESTAMP DEFAULT NOW()                  │
└──────────────────┴──────────────────────────────────────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                          USERS                              │
├──────────────────┬──────────────────────────────────────────┤
│ PK  id           │ VARCHAR(UUID)                            │
│ FK  tenant_id    │ VARCHAR(UUID) → tenants.id               │
│     email        │ VARCHAR(255) NOT NULL                    │
│     password_hash│ VARCHAR(255) NOT NULL                    │
│     full_name    │ VARCHAR(255) NOT NULL                    │
│     role         │ ENUM('super_admin','tenant_admin','user')│
│     is_active    │ BOOLEAN DEFAULT TRUE                     │
│     created_at   │ TIMESTAMP DEFAULT NOW()                  │
│     updated_at   │ TIMESTAMP DEFAULT NOW()                  │
├──────────────────┴──────────────────────────────────────────┤
│ UK  (tenant_id, email)                                      │
│ IDX (tenant_id)                                             │
└─────────────────────────────────────────────────────────────┘
           │
           │ 1:N (created_by)
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                        PROJECTS                             │
├──────────────────┬──────────────────────────────────────────┤
│ PK  id           │ VARCHAR(UUID)                            │
│ FK  tenant_id    │ VARCHAR(UUID) → tenants.id               │
│     name         │ VARCHAR(255) NOT NULL                    │
│     description  │ TEXT                                     │
│     status       │ ENUM('active','archived','completed')    │
│ FK  created_by   │ VARCHAR(UUID) → users.id                 │
│     created_at   │ TIMESTAMP DEFAULT NOW()                  │
│     updated_at   │ TIMESTAMP DEFAULT NOW()                  │
├──────────────────┴──────────────────────────────────────────┤
│ IDX (tenant_id)                                             │
│ IDX (tenant_id, status)                                     │
└─────────────────────────────────────────────────────────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                          TASKS                              │
├──────────────────┬──────────────────────────────────────────┤
│ PK  id           │ VARCHAR(UUID)                            │
│ FK  project_id   │ VARCHAR(UUID) → projects.id              │
│ FK  tenant_id    │ VARCHAR(UUID) → tenants.id               │
│     title        │ VARCHAR(255) NOT NULL                    │
│     description  │ TEXT                                     │
│     status       │ ENUM('todo','in_progress','completed')   │
│     priority     │ ENUM('low','medium','high')              │
│ FK  assigned_to  │ VARCHAR(UUID) → users.id (NULLABLE)      │
│     due_date     │ DATE (NULLABLE)                          │
│     created_at   │ TIMESTAMP DEFAULT NOW()                  │
│     updated_at   │ TIMESTAMP DEFAULT NOW()                  │
├──────────────────┴──────────────────────────────────────────┤
│ IDX (tenant_id, project_id)                                 │
│ IDX (tenant_id, status)                                     │
│ IDX (assigned_to)                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       AUDIT_LOGS                            │
├──────────────────┬──────────────────────────────────────────┤
│ PK  id           │ VARCHAR(UUID)                            │
│ FK  tenant_id    │ VARCHAR(UUID) → tenants.id (NULLABLE)    │
│ FK  user_id      │ VARCHAR(UUID) → users.id (NULLABLE)      │
│     action       │ VARCHAR(100) NOT NULL                    │
│     entity_type  │ VARCHAR(50)                              │
│     entity_id    │ VARCHAR(UUID)                            │
│     ip_address   │ VARCHAR(45)                              │
│     created_at   │ TIMESTAMP DEFAULT NOW()                  │
├──────────────────┴──────────────────────────────────────────┤
│ IDX (tenant_id, created_at)                                 │
│ IDX (user_id)                                               │
│ IDX (action)                                                │
└─────────────────────────────────────────────────────────────┘
```

### Key Schema Design Decisions

**1. UUID Primary Keys**

- Globally unique identifiers prevent collisions across tenants
- No auto-increment sequence leakage (security)
- Easier data migration and merging
- Slightly larger storage than integers (acceptable trade-off)

**2. Tenant ID Strategy**

- Every table (except tenants itself) has tenant_id foreign key
- Super admin users have tenant_id = NULL (special case)
- Composite unique constraints include tenant_id
- Indexes on tenant_id for query performance

**3. Cascade Delete Configuration**

```sql
-- When tenant is deleted, cascade to all related data
ALTER TABLE users
  ADD CONSTRAINT fk_users_tenant
  FOREIGN KEY (tenant_id)
  REFERENCES tenants(id)
  ON DELETE CASCADE;

-- When project is deleted, cascade to tasks
ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_project
  FOREIGN KEY (project_id)
  REFERENCES projects(id)
  ON DELETE CASCADE;

-- When user is deleted, set tasks to unassigned
ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_assigned
  FOREIGN KEY (assigned_to)
  REFERENCES users(id)
  ON DELETE SET NULL;
```

**4. Indexes for Performance**

```sql
-- Multi-tenant queries always filter by tenant_id
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_projects_tenant ON projects(tenant_id);
CREATE INDEX idx_tasks_tenant_project ON tasks(tenant_id, project_id);

-- Common filter combinations
CREATE INDEX idx_projects_tenant_status ON projects(tenant_id, status);
CREATE INDEX idx_tasks_tenant_status ON tasks(tenant_id, status);

-- Assignment lookups
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to) WHERE assigned_to IS NOT NULL;
```

**5. Audit Log Considerations**

- Append-only table (no UPDATE or DELETE permissions for app)
- Tenant_id and user_id can be NULL (system actions, deleted users)
- Partitioning by created_at month for large installations (future optimization)
- Separate retention policy (90 days minimum, configurable)

---

## API Architecture

### Complete API Endpoint List

#### Authentication Module (Public)

| Method | Endpoint                    | Auth     | Role | Description                            |
| ------ | --------------------------- | -------- | ---- | -------------------------------------- |
| POST   | `/api/auth/register-tenant` | None     | -    | Register new tenant with admin user    |
| POST   | `/api/auth/login`           | None     | -    | Authenticate user and return JWT       |
| GET    | `/api/auth/me`              | Required | All  | Get current user profile               |
| POST   | `/api/auth/logout`          | Required | All  | Logout user (optional session cleanup) |

#### Tenant Management Module

| Method | Endpoint                 | Auth     | Role        | Description                                     |
| ------ | ------------------------ | -------- | ----------- | ----------------------------------------------- |
| GET    | `/api/tenants`           | Required | Super Admin | List all tenants with pagination                |
| GET    | `/api/tenants/:tenantId` | Required | Admin       | Get tenant details and statistics               |
| PUT    | `/api/tenants/:tenantId` | Required | Admin       | Update tenant (limited fields for tenant_admin) |

#### User Management Module

| Method | Endpoint                       | Auth     | Role         | Description          |
| ------ | ------------------------------ | -------- | ------------ | -------------------- |
| POST   | `/api/tenants/:tenantId/users` | Required | Tenant Admin | Add user to tenant   |
| GET    | `/api/tenants/:tenantId/users` | Required | All          | List users in tenant |
| GET    | `/api/users/:userId`           | Required | All          | Get user details     |
| PUT    | `/api/users/:userId`           | Required | Admin/Self   | Update user profile  |
| DELETE | `/api/users/:userId`           | Required | Tenant Admin | Delete user          |

#### Project Management Module

| Method | Endpoint                   | Auth     | Role          | Description                |
| ------ | -------------------------- | -------- | ------------- | -------------------------- |
| POST   | `/api/projects`            | Required | All           | Create new project         |
| GET    | `/api/projects`            | Required | All           | List projects with filters |
| GET    | `/api/projects/:projectId` | Required | All           | Get project details        |
| PUT    | `/api/projects/:projectId` | Required | Admin/Creator | Update project             |
| DELETE | `/api/projects/:projectId` | Required | Admin/Creator | Delete project             |

#### Task Management Module

| Method | Endpoint                         | Auth     | Role  | Description              |
| ------ | -------------------------------- | -------- | ----- | ------------------------ |
| POST   | `/api/projects/:projectId/tasks` | Required | All   | Create task in project   |
| GET    | `/api/projects/:projectId/tasks` | Required | All   | List tasks with filters  |
| GET    | `/api/tasks/:taskId`             | Required | All   | Get task details         |
| PATCH  | `/api/tasks/:taskId/status`      | Required | All   | Quick status update      |
| PUT    | `/api/tasks/:taskId`             | Required | All   | Update task (all fields) |
| DELETE | `/api/tasks/:taskId`             | Required | Admin | Delete task              |

#### Health & Monitoring

| Method | Endpoint      | Auth | Role | Description                      |
| ------ | ------------- | ---- | ---- | -------------------------------- |
| GET    | `/api/health` | None | -    | Health check and database status |

**Total:** 19 API Endpoints (4 auth + 3 tenant + 5 user + 5 project + 6 task + 1 health)

### Standard Response Format

**Success Response (200, 201):**

```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Response payload
  }
}
```

**Error Response (400, 401, 403, 404, 409, 500):**

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is already in use"
    }
  ]
}
```

### HTTP Status Code Usage

| Code | Meaning      | When to Use                              |
| ---- | ------------ | ---------------------------------------- |
| 200  | OK           | Successful GET, PUT, DELETE request      |
| 201  | Created      | Successful POST creating new resource    |
| 400  | Bad Request  | Invalid input, validation failed         |
| 401  | Unauthorized | Missing or invalid JWT token             |
| 403  | Forbidden    | Valid token but insufficient permissions |
| 404  | Not Found    | Resource doesn't exist                   |
| 409  | Conflict     | Duplicate resource (email, subdomain)    |
| 500  | Server Error | Unexpected server error                  |

---

## Security Architecture

### Defense-in-Depth Layers

```
┌─────────────────────────────────────────────────────┐
│ Layer 1: Network Security                           │
│ - HTTPS/TLS 1.3                                     │
│ - CORS configuration                                │
│ - Rate limiting                                     │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│ Layer 2: Application Security                       │
│ - JWT verification                                  │
│ - Role-based authorization                          │
│ - Input validation                                  │
│ - XSS prevention                                    │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│ Layer 3: Data Security                              │
│ - Tenant isolation (tenant_id filtering)            │
│ - Password hashing (bcrypt)                         │
│ - Parameterized queries (SQL injection prevention)  │
│ - Audit logging                                     │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│ Layer 4: Database Security                          │
│ - Foreign key constraints                           │
│ - Row-level security policies (optional)            │
│ - Encrypted at rest                                 │
│ - Regular backups                                   │
└─────────────────────────────────────────────────────┘
```

### Middleware Stack

Request processing order:

1. **CORS Middleware:** Validate origin
2. **Rate Limiting:** Prevent abuse
3. **Body Parser:** Parse JSON
4. **Auth Middleware:** Verify JWT, extract user
5. **Tenant Context:** Inject tenant_id
6. **Authorization:** Check role permissions
7. **Validation:** Validate input
8. **Controller:** Business logic
9. **Audit Logging:** Log action
10. **Response:** Return JSON

---

## Deployment Architecture

### Docker Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Host                           │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │            Docker Network (bridge)                │  │
│  │                                                   │  │
│  │  ┌──────────────┐   ┌──────────────┐            │  │
│  │  │  Frontend    │   │   Backend    │            │  │
│  │  │  Container   │   │  Container   │            │  │
│  │  │              │   │              │            │  │
│  │  │  React App   │   │  Express API │            │  │
│  │  │  Port: 3000  │   │  Port: 5000  │            │  │
│  │  └──────┬───────┘   └──────┬───────┘            │  │
│  │         │                   │                    │  │
│  │         │                   │                    │  │
│  │         │          ┌────────▼─────────┐          │  │
│  │         │          │    Database      │          │  │
│  │         │          │    Container     │          │  │
│  │         │          │                  │          │  │
│  │         │          │  PostgreSQL 15   │          │  │
│  │         │          │  Port: 5432      │          │  │
│  │         │          └──────────────────┘          │  │
│  │         │                                        │  │
│  └─────────┼────────────────────────────────────────┘  │
│            │                                           │
└────────────┼───────────────────────────────────────────┘
             │
        ┌────▼────┐
        │  Users  │
        │ Browser │
        └─────────┘
```

### Service Communication

- **Frontend → Backend:** HTTP REST API (http://backend:5000/api)
- **Backend → Database:** PostgreSQL protocol (postgresql://database:5432)
- **External → Frontend:** HTTPS (https://platform.com)
- **External → Backend:** HTTPS via reverse proxy (https://api.platform.com)

### Environment Configuration

**Development:**

- Frontend: localhost:3000
- Backend: localhost:5000
- Database: localhost:5432
- CORS: Allow localhost

**Production:**

- Frontend: https://app.platform.com
- Backend: https://api.platform.com
- Database: Private network only
- CORS: Allow app.platform.com only

---

## Performance Optimization

### Database Query Optimization

**1. Always Filter by Tenant ID:**

```sql
-- Bad (scans entire table)
SELECT * FROM projects WHERE status = 'active';

-- Good (uses index on tenant_id)
SELECT * FROM projects
WHERE tenant_id = $1 AND status = 'active';
```

**2. Use Composite Indexes:**

```sql
-- Query: Get active projects for tenant
-- Index: (tenant_id, status)
CREATE INDEX idx_projects_tenant_status
ON projects(tenant_id, status);
```

**3. Pagination with Limit/Offset:**

```sql
-- Avoid fetching all records
SELECT * FROM tasks
WHERE tenant_id = $1
ORDER BY created_at DESC
LIMIT 50 OFFSET 0;
```

### API Response Time Targets

| Endpoint Type       | Target  | Example          |
| ------------------- | ------- | ---------------- |
| Simple GET          | < 100ms | Get user profile |
| List with filters   | < 200ms | List projects    |
| Create/Update       | < 300ms | Create task      |
| Complex aggregation | < 500ms | Dashboard stats  |
| Health check        | < 50ms  | System status    |

### Caching Strategy (Future Enhancement)

- **User sessions:** Redis cache for active JWTs
- **Tenant metadata:** Cache subscription limits
- **Static assets:** CDN for frontend files
- **Database queries:** Connection pooling

---

**Document Version:** 1.0  
**Last Updated:** December 22, 2025  
**Next Review:** January 15, 2026

**Note:** Architecture diagrams are described in ASCII art. For production documentation, convert to proper diagrams using tools like Lucidchart, Draw.io, or Mermaid.
