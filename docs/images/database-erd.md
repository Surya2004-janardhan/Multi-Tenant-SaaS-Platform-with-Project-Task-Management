# Database Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Multi-Tenant SaaS Database Schema                       │
│                           PostgreSQL 15 Database                             │
└─────────────────────────────────────────────────────────────────────────────┘


                    ┌──────────────────────────────────┐
                    │          TENANTS                 │
                    ├──────────────────────────────────┤
                    │ PK  id                 SERIAL    │
                    │     name               VARCHAR   │
                    │ UK  subdomain          VARCHAR   │
                    │     subscription_tier  VARCHAR   │
                    │     max_users          INTEGER   │
                    │     max_projects       INTEGER   │
                    │     created_at         TIMESTAMP │
                    │     updated_at         TIMESTAMP │
                    └──────────────────────────────────┘
                                 │
                                 │ 1
                                 │
                                 │
                    ┌────────────┴─────────────┐
                    │                          │
                    │                          │
                 N  │                       N  │
                    │                          │
                    ▼                          ▼
   ┌────────────────────────────┐   ┌──────────────────────────────┐
   │         USERS              │   │        PROJECTS              │
   ├────────────────────────────┤   ├──────────────────────────────┤
   │ PK  id           SERIAL    │   │ PK  id           SERIAL      │
   │ FK  tenant_id    INTEGER   │   │ FK  tenant_id    INTEGER     │
   │     email        VARCHAR   │   │     name         VARCHAR     │
   │     password_hash VARCHAR  │   │     description  TEXT        │
   │     full_name    VARCHAR   │   │     status       VARCHAR     │
   │     role         VARCHAR   │   │ FK  created_by   INTEGER ────┼──┐
   │     created_at   TIMESTAMP │   │     created_at   TIMESTAMP   │  │
   │     updated_at   TIMESTAMP │   │     updated_at   TIMESTAMP   │  │
   └────────────────────────────┘   └──────────────────────────────┘  │
                │                                    │                 │
                │                                    │ 1               │
                │                                    │                 │
                │                                    │                 │
                │                                 N  │                 │
                │                                    │                 │
                │                                    ▼                 │
                │                    ┌──────────────────────────────┐  │
                │                    │          TASKS               │  │
                │                    ├──────────────────────────────┤  │
                │                    │ PK  id           SERIAL      │  │
                │                    │ FK  project_id   INTEGER     │  │
                │                    │ FK  tenant_id    INTEGER     │  │
                │                    │     title        VARCHAR     │  │
                │                    │     description  TEXT        │  │
                │                    │     status       VARCHAR     │  │
                │                    │     priority     VARCHAR     │  │
                │         ┌──────────┼ FK  assigned_to  INTEGER     │  │
                │         │          │ FK  created_by   INTEGER ────┼──┘
                │         │          │     due_date     DATE        │
                │         │          │     created_at   TIMESTAMP   │
                │         │          │     updated_at   TIMESTAMP   │
                │         │          └──────────────────────────────┘
                │         │
                │      N  │
                │         │
                └─────────┘


   ┌────────────────────────────┐
   │       AUDIT_LOGS           │
   ├────────────────────────────┤
   │ PK  id            SERIAL   │
   │ FK  tenant_id     INTEGER  │────┐
   │ FK  user_id       INTEGER  │    │ References TENANTS.id
   │     action        VARCHAR  │    │
   │     resource_type VARCHAR  │    │
   │     resource_id   INTEGER  │    │
   │     details       JSONB    │    │
   │     timestamp     TIMESTAMP│    │
   └────────────────────────────┘    │
                                     │
                                     └─────────────────┐
                                                       ▼
                                          ┌──────────────────────┐
                                          │      TENANTS         │
                                          │  (Referenced Above)  │
                                          └──────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                            RELATIONSHIP DETAILS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. TENANTS ──< USERS (One-to-Many)                                         │
│     • Each tenant can have multiple users                                   │
│     • Each user belongs to exactly one tenant                               │
│     • FK: users.tenant_id → tenants.id                                      │
│     • Cascade: ON DELETE CASCADE (delete users when tenant deleted)         │
│                                                                              │
│  2. TENANTS ──< PROJECTS (One-to-Many)                                      │
│     • Each tenant can have multiple projects                                │
│     • Each project belongs to exactly one tenant                            │
│     • FK: projects.tenant_id → tenants.id                                   │
│     • Cascade: ON DELETE CASCADE                                            │
│                                                                              │
│  3. USERS ──< PROJECTS (One-to-Many, Creator)                               │
│     • Each user can create multiple projects                                │
│     • Each project is created by one user                                   │
│     • FK: projects.created_by → users.id                                    │
│     • Constraint: creator must belong to same tenant                        │
│                                                                              │
│  4. PROJECTS ──< TASKS (One-to-Many)                                        │
│     • Each project can have multiple tasks                                  │
│     • Each task belongs to exactly one project                              │
│     • FK: tasks.project_id → projects.id                                    │
│     • Cascade: ON DELETE CASCADE (delete tasks when project deleted)        │
│                                                                              │
│  5. USERS ──< TASKS (One-to-Many, Assigned)                                 │
│     • Each user can be assigned multiple tasks                              │
│     • Each task can be assigned to one user (nullable)                      │
│     • FK: tasks.assigned_to → users.id (NULLABLE)                           │
│     • Constraint: assigned user must belong to same tenant                  │
│                                                                              │
│  6. USERS ──< TASKS (One-to-Many, Creator)                                  │
│     • Each user can create multiple tasks                                   │
│     • Each task is created by one user                                      │
│     • FK: tasks.created_by → users.id                                       │
│                                                                              │
│  7. TENANTS ──< AUDIT_LOGS (One-to-Many)                                    │
│     • Each tenant has its own audit trail                                   │
│     • Logs are isolated per tenant for security                             │
│     • FK: audit_logs.tenant_id → tenants.id                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          TABLE DETAILS & CONSTRAINTS                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  TABLE: tenants                                                           │
├──────────────────────────────────────────────────────────────────────────┤
│  COLUMNS:                                                                 │
│    • id               SERIAL PRIMARY KEY                                 │
│    • name             VARCHAR(255) NOT NULL                              │
│    • subdomain        VARCHAR(100) UNIQUE NOT NULL                       │
│    • subscription_tier VARCHAR(50) DEFAULT 'free'                        │
│                       CHECK (subscription_tier IN ('free','pro','enterprise'))│
│    • max_users        INTEGER DEFAULT 5                                  │
│    • max_projects     INTEGER DEFAULT 10                                 │
│    • created_at       TIMESTAMP DEFAULT NOW()                            │
│    • updated_at       TIMESTAMP DEFAULT NOW()                            │
│                                                                           │
│  INDEXES:                                                                 │
│    • idx_tenants_subdomain ON subdomain (UNIQUE)                         │
│                                                                           │
│  NOTES:                                                                   │
│    • Subdomain used for tenant identification during login               │
│    • Subscription limits enforced at application level                   │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  TABLE: users                                                             │
├──────────────────────────────────────────────────────────────────────────┤
│  COLUMNS:                                                                 │
│    • id               SERIAL PRIMARY KEY                                 │
│    • tenant_id        INTEGER NOT NULL REFERENCES tenants(id)            │
│                       ON DELETE CASCADE                                   │
│    • email            VARCHAR(255) NOT NULL                              │
│    • password_hash    VARCHAR(255) NOT NULL                              │
│    • full_name        VARCHAR(255) NOT NULL                              │
│    • role             VARCHAR(50) DEFAULT 'user'                         │
│                       CHECK (role IN ('super_admin','tenant_admin','user'))│
│    • created_at       TIMESTAMP DEFAULT NOW()                            │
│    • updated_at       TIMESTAMP DEFAULT NOW()                            │
│                                                                           │
│  INDEXES:                                                                 │
│    • idx_users_tenant_id ON tenant_id                                    │
│    • idx_users_email ON email                                            │
│    • UNIQUE(tenant_id, email) - Email unique per tenant                  │
│                                                                           │
│  NOTES:                                                                   │
│    • Password stored as bcrypt hash (10 rounds)                          │
│    • super_admin role for system administrators                          │
│    • tenant_admin can manage users/projects within tenant                │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  TABLE: projects                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  COLUMNS:                                                                 │
│    • id               SERIAL PRIMARY KEY                                 │
│    • tenant_id        INTEGER NOT NULL REFERENCES tenants(id)            │
│                       ON DELETE CASCADE                                   │
│    • name             VARCHAR(255) NOT NULL                              │
│    • description      TEXT                                               │
│    • status           VARCHAR(50) DEFAULT 'active'                       │
│                       CHECK (status IN ('active','archived','completed'))│
│    • created_by       INTEGER NOT NULL REFERENCES users(id)              │
│    • created_at       TIMESTAMP DEFAULT NOW()                            │
│    • updated_at       TIMESTAMP DEFAULT NOW()                            │
│                                                                           │
│  INDEXES:                                                                 │
│    • idx_projects_tenant_id ON tenant_id                                 │
│    • idx_projects_created_by ON created_by                               │
│    • idx_projects_status ON status                                       │
│                                                                           │
│  NOTES:                                                                   │
│    • Status tracks project lifecycle                                     │
│    • Created by user must belong to same tenant (enforced in app)        │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  TABLE: tasks                                                             │
├──────────────────────────────────────────────────────────────────────────┤
│  COLUMNS:                                                                 │
│    • id               SERIAL PRIMARY KEY                                 │
│    • project_id       INTEGER NOT NULL REFERENCES projects(id)           │
│                       ON DELETE CASCADE                                   │
│    • tenant_id        INTEGER NOT NULL REFERENCES tenants(id)            │
│    • title            VARCHAR(255) NOT NULL                              │
│    • description      TEXT                                               │
│    • status           VARCHAR(50) DEFAULT 'todo'                         │
│                       CHECK (status IN ('todo','in_progress','done'))    │
│    • priority         VARCHAR(50) DEFAULT 'medium'                       │
│                       CHECK (priority IN ('low','medium','high'))        │
│    • assigned_to      INTEGER REFERENCES users(id) - NULLABLE           │
│    • created_by       INTEGER NOT NULL REFERENCES users(id)              │
│    • due_date         DATE                                               │
│    • created_at       TIMESTAMP DEFAULT NOW()                            │
│    • updated_at       TIMESTAMP DEFAULT NOW()                            │
│                                                                           │
│  INDEXES:                                                                 │
│    • idx_tasks_project_id ON project_id                                  │
│    • idx_tasks_tenant_id ON tenant_id                                    │
│    • idx_tasks_assigned_to ON assigned_to                                │
│    • idx_tasks_status ON status                                          │
│    • idx_tasks_priority ON priority                                      │
│                                                                           │
│  NOTES:                                                                   │
│    • tenant_id denormalized for faster queries                           │
│    • assigned_to is nullable (unassigned tasks allowed)                  │
│    • due_date is optional                                                │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  TABLE: audit_logs                                                        │
├──────────────────────────────────────────────────────────────────────────┤
│  COLUMNS:                                                                 │
│    • id               SERIAL PRIMARY KEY                                 │
│    • tenant_id        INTEGER NOT NULL REFERENCES tenants(id)            │
│    • user_id          INTEGER REFERENCES users(id)                       │
│    • action           VARCHAR(100) NOT NULL                              │
│                       (e.g., 'CREATE', 'UPDATE', 'DELETE')               │
│    • resource_type    VARCHAR(100) NOT NULL                              │
│                       (e.g., 'project', 'task', 'user')                  │
│    • resource_id      INTEGER                                            │
│    • details          JSONB - Flexible metadata storage                  │
│    • timestamp        TIMESTAMP DEFAULT NOW()                            │
│                                                                           │
│  INDEXES:                                                                 │
│    • idx_audit_tenant_id ON tenant_id                                    │
│    • idx_audit_user_id ON user_id                                        │
│    • idx_audit_timestamp ON timestamp                                    │
│    • idx_audit_resource ON (resource_type, resource_id)                  │
│                                                                           │
│  NOTES:                                                                   │
│    • JSONB details column for flexible audit data                        │
│    • Partition by timestamp for large datasets (future optimization)     │
└──────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         MULTI-TENANT ISOLATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Strategy: SHARED SCHEMA with tenant_id discrimination                      │
│                                                                              │
│  Every query MUST include tenant_id filter:                                 │
│    • SELECT * FROM users WHERE tenant_id = $1                               │
│    • INSERT INTO projects (tenant_id, ...) VALUES ($1, ...)                 │
│    • UPDATE tasks SET ... WHERE id = $1 AND tenant_id = $2                  │
│                                                                              │
│  Middleware enforces:                                                        │
│    1. Extract tenant_id from JWT token                                      │
│    2. Inject tenant_id into req.tenantId                                    │
│    3. All models automatically filter by tenant_id                          │
│                                                                              │
│  Prevents cross-tenant data leakage:                                         │
│    • User from Tenant A cannot access Tenant B's projects                   │
│    • Even with valid IDs, tenant_id mismatch returns 404                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          SAMPLE DATA RELATIONSHIPS                           │
└─────────────────────────────────────────────────────────────────────────────┘

TENANT: TechCorp (id=1, subdomain=techcorp)
  └─ USERS:
       ├─ admin@techcorp.com (id=1, role=tenant_admin)
       └─ dev@techcorp.com (id=2, role=user)
  └─ PROJECTS:
       ├─ Website Redesign (id=1, created_by=1)
       │    └─ TASKS:
       │         ├─ Design mockup (id=1, assigned_to=2, status=in_progress)
       │         └─ Build frontend (id=2, assigned_to=2, status=todo)
       └─ Mobile App (id=2, created_by=1)
            └─ TASKS:
                 └─ Setup repository (id=3, assigned_to=1, status=done)

TENANT: StartupCo (id=2, subdomain=startupco)
  └─ USERS:
       └─ founder@startupco.com (id=3, role=tenant_admin)
  └─ PROJECTS:
       └─ MVP Development (id=3, created_by=3)
            └─ TASKS:
                 └─ User research (id=4, assigned_to=3, status=todo)

```

---

## Database Statistics

**Total Tables**: 5  
**Total Relationships**: 7  
**Indexing Strategy**: tenant_id on all multi-tenant tables  
**Data Isolation**: 100% via shared schema with tenant_id  
**Estimated Size** (1000 tenants, avg 10 users each):
- Tenants: ~50KB
- Users: ~500KB
- Projects: ~1MB
- Tasks: ~5MB
- Audit Logs: ~10MB (grows over time)

---

**Database Version**: PostgreSQL 15  
**Last Updated**: December 2024
