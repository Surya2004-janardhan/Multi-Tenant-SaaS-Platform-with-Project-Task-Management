# Multi-Tenant SaaS Platform - Backend

RESTful API backend for a multi-tenant SaaS platform with project and task management capabilities.

## 🚀 Tech Stack

- **Runtime:** Node.js 18.x LTS
- **Framework:** Express.js 4.18.x
- **Database:** PostgreSQL 15.x
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Multi-Tenancy:** Shared Database + Shared Schema (tenant_id discriminator)

## 📁 Project Structure

```
backend/
├── database/
│   ├── migrations/          # SQL migration files
│   │   ├── 001_create_tenants.sql
│   │   ├── 002_create_users.sql
│   │   ├── 003_create_projects.sql
│   │   ├── 004_create_tasks.sql
│   │   └── 005_create_audit_logs.sql
│   ├── seeds/              # Seed data files
│   │   └── 001_seed_data.sql
│   ├── run-migrations.js   # Migration runner script
│   └── run-seeds.js        # Seed runner script
├── src/
│   ├── config/             # Configuration files
│   │   ├── database.js     # PostgreSQL connection pool
│   │   ├── jwt.js          # JWT configuration
│   │   └── cors.js         # CORS settings
│   ├── controllers/        # Request handlers
│   │   ├── authController.js
│   │   ├── tenantController.js
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── healthController.js
│   ├── middleware/         # Express middleware
│   │   ├── auth.js         # JWT verification
│   │   ├── authorize.js    # Role-based access control
│   │   ├── tenantContext.js # Tenant isolation
│   │   ├── validation.js   # Input validation
│   │   └── errorHandler.js # Global error handling
│   ├── models/            # Database models (functional approach)
│   │   ├── tenantModel.js
│   │   ├── userModel.js
│   │   ├── projectModel.js
│   │   ├── taskModel.js
│   │   └── auditModel.js
│   ├── routes/            # API route definitions
│   │   ├── authRoutes.js
│   │   ├── tenantRoutes.js
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── healthRoutes.js
│   │   └── index.js       # Main router
│   ├── services/          # Business logic services
│   │   ├── hashService.js         # Password hashing
│   │   ├── tokenService.js        # JWT operations
│   │   ├── subscriptionService.js # Subscription limit checks
│   │   └── auditService.js        # Audit logging
│   ├── utils/            # Utility functions
│   │   ├── constants.js  # Application constants
│   │   ├── helpers.js    # Helper functions
│   │   └── validators.js # Input validators
│   └── index.js          # Express app entry point
├── .env.example          # Environment variables template
├── .gitignore
└── package.json
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```powershell
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_platform
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 3. Setup PostgreSQL Database

```powershell
# Create database
psql -U postgres -c "CREATE DATABASE saas_platform;"

# Run migrations
cd database
node run-migrations.js

# (Optional) Load seed data
node run-seeds.js
```

### 4. Start the Server

```powershell
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:3000`

## 📊 Database Schema

### Tables

1. **tenants** - Tenant organizations
2. **users** - Users belonging to tenants
3. **projects** - Projects within tenants
4. **tasks** - Tasks within projects
5. **audit_logs** - Activity audit trail

### Multi-Tenant Isolation

- All tables (except `tenants`) include a `tenant_id` column
- Database queries filter by `tenant_id` to ensure data isolation
- Users with `super_admin` role have `tenant_id = NULL`

### Subscription Plans

| Plan       | Max Users | Max Projects |
| ---------- | --------- | ------------ |
| Free       | 5         | 3            |
| Pro        | 25        | 15           |
| Enterprise | 100       | 50           |

## 🔐 Authentication & Authorization

### User Roles

- **super_admin** - Platform administrator (tenant_id = NULL)
- **tenant_admin** - Tenant administrator
- **user** - Regular user

### JWT Token Structure

```json
{
  "userId": "uuid",
  "tenantId": "uuid",
  "role": "tenant_admin",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Protected Routes

All routes except `/api/auth/register` and `/api/auth/login` require authentication.

## 🛣️ API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint  | Description              | Access  |
| ------ | --------- | ------------------------ | ------- |
| POST   | /register | Register new tenant      | Public  |
| POST   | /login    | User login               | Public  |
| GET    | /me       | Get current user profile | Private |
| POST   | /logout   | Logout user              | Private |

### Tenants (`/api/tenants`)

| Method | Endpoint | Description      | Role Required |
| ------ | -------- | ---------------- | ------------- |
| GET    | /        | List all tenants | super_admin   |
| GET    | /:id     | Get tenant by ID | super_admin   |
| PUT    | /:id     | Update tenant    | super_admin   |

### Users (`/api/users`)

| Method | Endpoint | Description          | Role Required |
| ------ | -------- | -------------------- | ------------- |
| POST   | /        | Create user          | tenant_admin  |
| GET    | /        | List users in tenant | authenticated |
| PUT    | /:id     | Update user          | tenant_admin  |
| DELETE | /:id     | Delete user          | tenant_admin  |

### Projects (`/api/projects`)

| Method | Endpoint | Description             | Role Required |
| ------ | -------- | ----------------------- | ------------- |
| POST   | /        | Create project          | authenticated |
| GET    | /        | List projects in tenant | authenticated |
| GET    | /:id     | Get project by ID       | authenticated |
| PUT    | /:id     | Update project          | authenticated |
| DELETE | /:id     | Delete project          | authenticated |

### Tasks (`/api/tasks`)

| Method | Endpoint            | Description           | Role Required |
| ------ | ------------------- | --------------------- | ------------- |
| POST   | /                   | Create task           | authenticated |
| GET    | /project/:projectId | List tasks by project | authenticated |
| GET    | /:id                | Get task by ID        | authenticated |
| PUT    | /:id                | Update task           | authenticated |
| PATCH  | /:id/status         | Update task status    | authenticated |
| DELETE | /:id                | Delete task           | authenticated |

### Health (`/api/health`)

| Method | Endpoint | Description  | Access |
| ------ | -------- | ------------ | ------ |
| GET    | /        | Health check | Public |

## 📝 Request/Response Examples

### Register Tenant

**Request:**

```bash
POST /api/auth/register
Content-Type: application/json

{
  "tenantName": "Acme Corp",
  "subdomain": "acme",
  "adminEmail": "admin@acme.com",
  "adminPassword": "SecurePass123!",
  "adminFullName": "John Doe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenant": {
      "id": "uuid",
      "name": "Acme Corp",
      "subdomain": "acme"
    },
    "user": {
      "id": "uuid",
      "email": "admin@acme.com",
      "fullName": "John Doe",
      "role": "tenant_admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

**Request:**

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@acme.com",
  "password": "SecurePass123!",
  "tenantSubdomain": "acme"
}
```

### Create Project

**Request:**

```bash
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Complete overhaul of company website"
}
```

### Create Task

**Request:**

```bash
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "uuid",
  "title": "Design homepage mockup",
  "description": "Create high-fidelity mockup for homepage",
  "priority": "high",
  "dueDate": "2024-02-01",
  "assignedTo": "user-uuid"
}
```

## 🔍 Query Parameters

### Pagination

All list endpoints support pagination:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10 for most, 20 for tasks)

Example: `/api/users?page=2&limit=20`

### Filtering

- **Users:** `search`, `role`
- **Projects:** `status`
- **Tasks:** `status`, `priority`, `assignedTo`

Example: `/api/tasks/project/uuid?status=in-progress&priority=high`

## 🧪 Testing Credentials (Seed Data)

After running `node run-seeds.js`:

### TechCorp (subdomain: techcorp)

- **Admin:** admin@techcorp.com / Password123!
- **Users:** sarah.johnson@techcorp.com, mike.davis@techcorp.com, emily.brown@techcorp.com

### DesignHub (subdomain: designhub)

- **Admin:** admin@designhub.com / Password123!
- **User:** alex.kim@designhub.com

## 🛡️ Security Features

- **Password Hashing:** bcrypt with 10 salt rounds
- **JWT Authentication:** HS256 algorithm, 24-hour expiry
- **SQL Injection Prevention:** Parameterized queries
- **CORS Protection:** Configured for frontend origin
- **Role-Based Access Control:** Middleware-enforced permissions
- **Tenant Isolation:** Automatic tenant_id filtering
- **Audit Logging:** All actions logged with IP address

## 📈 Performance Considerations

- **Connection Pooling:** PostgreSQL pool with max 20 connections
- **Indexed Queries:** Database indexes on frequently queried columns
- **Pagination:** Default limits to prevent large result sets
- **Task Ordering:** Optimized with priority + due date sorting

## 🔄 Database Migration Workflow

1. Create new migration file: `00X_migration_name.sql`
2. Write SQL in migration file
3. Run: `node database/run-migrations.js`
4. Migrations run in order (001, 002, 003...)

## 🐛 Error Handling

All errors are caught and formatted consistently:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 📦 Available Scripts

```powershell
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (when implemented)
```

## 🚧 Future Enhancements

- [ ] Unit and integration tests
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Rate limiting
- [ ] Redis caching
- [ ] File upload support
- [ ] Email notifications
- [ ] Webhook support
- [ ] Advanced analytics

## 📄 License

MIT
