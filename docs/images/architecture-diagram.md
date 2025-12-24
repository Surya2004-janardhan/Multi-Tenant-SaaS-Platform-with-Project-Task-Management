# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Multi-Tenant SaaS Platform                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                               PRESENTATION LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     React Frontend (Port 3000)                        │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  • React 18.2 + React Router 6                                       │  │
│  │  • Tailwind CSS 3.4 (Responsive UI)                                  │  │
│  │  • Axios HTTP Client                                                 │  │
│  │  • JWT Token Management                                              │  │
│  │  • Protected Routes + Auth Context                                   │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  Components: Login, Register, Dashboard, Projects, Tasks, Users     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                     │                                        │
│                                     │ HTTPS / REST API                       │
│                                     ▼                                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                   Node.js Backend API (Port 5000)                     │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                          MIDDLEWARE STACK                             │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  1. Request Logger      → Log all incoming requests                  │  │
│  │  2. CORS Handler        → Cross-origin resource sharing              │  │
│  │  3. Body Parser         → JSON request parsing                       │  │
│  │  4. Authentication      → JWT token validation                       │  │
│  │  5. Tenant Context      → Multi-tenant isolation                     │  │
│  │  6. Request Validation  → Input sanitization                         │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                        API ROUTE HANDLERS                             │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  • /api/auth/*          → Authentication (login, register, logout)   │  │
│  │  • /api/tenants/*       → Tenant management                          │  │
│  │  • /api/users/*         → User CRUD operations                       │  │
│  │  • /api/projects/*      → Project management                         │  │
│  │  • /api/tasks/*         → Task tracking system                       │  │
│  │  • /api/health          → Health check endpoint                      │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                       BUSINESS LOGIC LAYER                            │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  Controllers:                                                         │  │
│  │    • authController      → Login, register, session management       │  │
│  │    • tenantController    → Tenant CRUD + subscription limits         │  │
│  │    • userController      → User management per tenant                │  │
│  │    • projectController   → Project tracking                          │  │
│  │    • taskController      → Task assignment + status updates          │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  Models (Functional):                                                │  │
│  │    • Tenant.js          → Tenant data access layer                   │  │
│  │    • User.js            → User authentication + authorization        │  │
│  │    • Project.js         → Project data operations                    │  │
│  │    • Task.js            → Task CRUD + assignments                    │  │
│  │    • AuditLog.js        → Audit trail logging                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                     │                                        │
│                                     │ SQL Queries                            │
│                                     ▼                                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                DATA LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                  PostgreSQL Database (Port 5432)                      │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  DATABASE SCHEMA (Shared Schema Multi-Tenancy)                       │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                                                                       │  │
│  │  ┌─────────────────┐       ┌─────────────────┐                      │  │
│  │  │    TENANTS      │◄──┐   │     USERS       │                      │  │
│  │  ├─────────────────┤   │   ├─────────────────┤                      │  │
│  │  │ id (PK)         │   └───│ tenant_id (FK)  │                      │  │
│  │  │ name            │       │ email           │                      │  │
│  │  │ subdomain       │       │ password_hash   │                      │  │
│  │  │ subscription    │       │ full_name       │                      │  │
│  │  │ max_users       │       │ role            │                      │  │
│  │  │ max_projects    │       │ created_at      │                      │  │
│  │  └─────────────────┘       └─────────────────┘                      │  │
│  │           │                          │                               │  │
│  │           │                          │                               │  │
│  │           │         ┌─────────────────────────┐                     │  │
│  │           │         │      PROJECTS           │                     │  │
│  │           │         ├─────────────────────────┤                     │  │
│  │           └────────►│ tenant_id (FK)          │                     │  │
│  │                     │ name                    │                     │  │
│  │                     │ description             │                     │  │
│  │                     │ status                  │                     │  │
│  │                     │ created_by (FK→users)   │                     │  │
│  │                     └─────────────────────────┘                     │  │
│  │                                 │                                    │  │
│  │                                 │                                    │  │
│  │                     ┌───────────▼──────────┐                        │  │
│  │                     │       TASKS          │                        │  │
│  │                     ├──────────────────────┤                        │  │
│  │                     │ project_id (FK)      │                        │  │
│  │                     │ tenant_id (FK)       │                        │  │
│  │                     │ title                │                        │  │
│  │                     │ status               │                        │  │
│  │                     │ priority             │                        │  │
│  │                     │ assigned_to (FK)     │                        │  │
│  │                     │ due_date             │                        │  │
│  │                     └──────────────────────┘                        │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │               AUDIT_LOGS (Activity Tracking)                 │   │  │
│  │  ├─────────────────────────────────────────────────────────────┤   │  │
│  │  │ tenant_id, user_id, action, resource_type, timestamp        │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  │                                                                       │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  DATA ISOLATION: tenant_id filtering on ALL queries                 │  │
│  │  INDEXES: tenant_id, email, subdomain, project_id                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          INFRASTRUCTURE LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                          Docker Containers                            │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                                                                       │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐    │  │
│  │  │   FRONTEND      │  │    BACKEND      │  │    DATABASE      │    │  │
│  │  │   Container     │  │   Container     │  │   Container      │    │  │
│  │  ├─────────────────┤  ├─────────────────┤  ├──────────────────┤    │  │
│  │  │ Nginx + React   │  │ Node.js 18      │  │ PostgreSQL 15    │    │  │
│  │  │ Port: 3000      │  │ Port: 5000      │  │ Port: 5432       │    │  │
│  │  │                 │  │ Auto Migrations │  │ Persistent Vol   │    │  │
│  │  └─────────────────┘  └─────────────────┘  └──────────────────┘    │  │
│  │                                                                       │  │
│  │  Orchestration: docker-compose.yml                                   │  │
│  │  Networking: Bridge network (app-network)                            │  │
│  │  Volumes: postgres-data (persistent database storage)                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY & AUTHENTICATION                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  • JWT Token Authentication (24h expiry)                                    │
│  • Bcrypt Password Hashing (10 salt rounds)                                 │
│  • Role-Based Access Control (super_admin, tenant_admin, user)              │
│  • Tenant Isolation via middleware                                          │
│  • Input Validation & Sanitization                                          │
│  • CORS Protection                                                           │
│  • SQL Injection Prevention (Parameterized queries)                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         MULTI-TENANCY STRATEGY                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Architecture: SHARED SCHEMA (Single Database)                              │
│  Isolation Method: tenant_id discriminator column                           │
│  Benefits:                                                                   │
│    • Cost-effective resource sharing                                        │
│    • Simplified database maintenance                                        │
│    • Efficient for small-medium SaaS                                        │
│  Tenant Context:                                                             │
│    1. Login with subdomain → Retrieve tenant_id                             │
│    2. JWT stores tenant_id in payload                                       │
│    3. Middleware injects tenant_id in req.tenantId                          │
│    4. All queries auto-filter by tenant_id                                  │
│  Subscription Limits:                                                        │
│    • max_users: User creation limit per tenant                              │
│    • max_projects: Project creation limit per tenant                        │
│    • Enforced at controller level before creation                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW EXAMPLE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  User Action: Create New Task                                               │
│  ────────────────────────────────────────────────────────────────────────   │
│  1. Frontend: POST /api/tasks {title, projectId, ...}                       │
│  2. Middleware: Verify JWT → Extract tenantId from token                    │
│  3. Middleware: Inject tenantId into req.tenantId                           │
│  4. Controller: taskController.create()                                     │
│     • Validate input data                                                   │
│     • Verify project exists in tenant                                       │
│     • Check assigned user belongs to tenant                                 │
│  5. Model: Task.create({...taskData, tenantId})                             │
│     • INSERT with tenant_id filter                                          │
│  6. Audit: Log task creation event                                          │
│  7. Response: Return created task JSON                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. **Shared Schema Multi-Tenancy**
- Single PostgreSQL database with `tenant_id` discrimination
- Reduces infrastructure costs
- Simplifies backups and migrations
- Suitable for up to 1000s of tenants

### 2. **Stateless JWT Authentication**
- No server-side session storage
- Horizontal scaling friendly
- 24-hour token expiry for security

### 3. **Functional Programming Pattern**
- Models use pure functions instead of OOP classes
- Easier testing and debugging
- Explicit dependency injection

### 4. **Docker Containerization**
- Consistent dev/prod environments
- Easy deployment and scaling
- Automated database migrations on startup

### 5. **API-First Design**
- RESTful endpoints with JSON payloads
- Clear separation of concerns
- Frontend framework agnostic

---

**Note**: For production deployment, consider:
- Adding Redis for session caching
- Implementing rate limiting
- Setting up database read replicas
- Adding monitoring (Prometheus/Grafana)
- Configuring CDN for frontend assets
