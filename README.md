# Multi-Tenant SaaS Platform with Project & Task Management

A comprehensive multi-tenant Software-as-a-Service (SaaS) platform featuring project and task management capabilities. Built with Node.js, PostgreSQL, and React, this platform demonstrates enterprise-grade multi-tenancy architecture, role-based access control, and containerized deployment.

---

## 🚀 Quick Start with Docker

The fastest way to run the complete application stack:

```bash
# 1. Clone the repository
git clone <repository-url>
cd Multi-Tenant-SaaS-Platform-with-Project-Task-Management

# 2. Build and start all services
docker-compose up -d

# 3. Wait for services to be healthy (30-60 seconds)
docker-compose ps

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
# Database: localhost:5432
```

**Test Credentials** (from `submission.json`):
- **Tenant Subdomain**: acmecorp
- **Admin**: admin@acmecorp.com / password123
- **User 1**: user1@acmecorp.com / password123
- **User 2**: user2@acmecorp.com / password123
- **Super Admin**: superadmin@system.com / Admin@123

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
  - [Docker Deployment](#docker-deployment-recommended)
  - [Local Development](#local-development)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Multi-Tenancy](#-multi-tenancy-implementation)
- [Security](#-security)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Multi-Tenancy
- **Shared Schema Architecture**: Single database with tenant_id isolation
- **Subdomain-Based Tenant Identification**: Each organization has unique subdomain
- **Subscription Tiers**: Free, Pro, Enterprise with configurable limits
- **Resource Isolation**: Complete data separation between tenants
- **Subscription Limits**: Enforced user and project quotas per plan

### Authentication & Authorization
- **JWT Token Authentication**: Stateless authentication with 24-hour expiry
- **Role-Based Access Control (RBAC)**:
  - `super_admin`: System administrator with cross-tenant access
  - `tenant_admin`: Organization admin with full tenant management
  - `user`: Standard user with limited permissions
- **Secure Password Storage**: Bcrypt hashing with 10 salt rounds
- **Session Management**: Token-based with automatic refresh

### Project Management
- Create, read, update, and delete projects
- Project status tracking (active, archived, completed)
- Project-user associations
- Task organization per project
- Project search and filtering
- Pagination support

### Task Management
- Comprehensive CRUD operations for tasks
- Task assignment to users
- Priority levels (low, medium, high)
- Status workflow (todo, in_progress, done)
- Due date tracking
- Task filtering and search
- Bulk operations support

### User Management
- Tenant-scoped user creation and management
- Email-based authentication
- Profile management
- User role assignment
- User search and filtering
- Account suspension capabilities

### Audit & Logging
- Complete audit trail for all actions
- Tenant-isolated logs
- Resource tracking (user, project, task operations)
- JSONB metadata storage for flexible logging
- Timestamp-indexed for performance

### Frontend Features
- **Responsive Design**: Tailwind CSS mobile-first approach
- **Modern UI**: Clean, professional interface
- **Real-time Updates**: Immediate feedback on all operations
- **Dashboard**: Overview of projects, tasks, and team activity
- **Protected Routes**: Client-side authorization enforcement
- **Error Handling**: User-friendly error messages
- **Loading States**: Smooth UX with loading indicators

---

## 🏗️ Architecture

### System Overview

The platform follows a three-tier architecture pattern:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │ ───► │   Backend   │ ───► │  Database   │
│  React SPA  │      │  Node.js    │      │ PostgreSQL  │
│  Port 3000  │      │  Port 5000  │      │  Port 5432  │
└─────────────┘      └─────────────┘      └─────────────┘
```

**Full Architecture Diagram**: See [docs/images/architecture-diagram.md](docs/images/architecture-diagram.md)

### Key Components

1. **Presentation Layer** (Frontend)
   - React 18.2 with functional components and hooks
   - React Router 6 for client-side routing
   - Axios for API communication
   - Tailwind CSS for styling
   - JWT token storage in localStorage

2. **Application Layer** (Backend)
   - Express.js 4.18 REST API server
   - Middleware stack:
     - Request logging
     - CORS handling
     - JWT authentication
     - Tenant context injection
     - Input validation
   - Controllers for business logic
   - Functional model layer for data access
   - Database migrations and seeding

3. **Data Layer** (Database)
   - PostgreSQL 15 relational database
   - Shared schema multi-tenancy
   - Foreign key constraints
   - Indexes on tenant_id for performance
   - Audit logging table

### Multi-Tenancy Strategy

**Shared Schema with Discriminator Column**

All tenant data stored in single database with `tenant_id` filtering:

```sql
-- Every query includes tenant_id
SELECT * FROM projects WHERE tenant_id = $1;
INSERT INTO tasks (tenant_id, title, ...) VALUES ($1, $2, ...);
```

**Benefits**:
- Cost-effective resource sharing
- Simplified database maintenance
- Easy backups and migrations
- Efficient for small to medium SaaS

**Trade-offs**:
- Requires strict query discipline
- Less isolation than schema-per-tenant
- Potential noisy neighbor issues

See [Multi-Tenancy Implementation](#-multi-tenancy-implementation) for details.

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18 LTS
- **Framework**: Express.js 4.18
- **Database**: PostgreSQL 15
- **ORM/Query Builder**: Native pg driver (raw SQL)
- **Authentication**: JSON Web Tokens (jsonwebtoken 9.0)
- **Password Hashing**: bcryptjs 2.4
- **Validation**: express-validator 7.0
- **Environment**: dotenv 16.4
- **CORS**: cors 2.8

### Frontend
- **Library**: React 18.2
- **Build Tool**: Create React App
- **Routing**: React Router DOM 6.22
- **HTTP Client**: Axios 1.6
- **Styling**: Tailwind CSS 3.4
- **Icons**: Heroicons (via Tailwind)

### Database
- **DBMS**: PostgreSQL 15-alpine
- **Driver**: node-postgres (pg)
- **Migrations**: Custom SQL migration system
- **Connection Pooling**: pg.Pool

### DevOps
- **Containerization**: Docker 24+, Docker Compose 3.8
- **Web Server**: Nginx (for frontend in production)
- **Process Management**: Docker health checks
- **Logging**: Morgan (HTTP request logging)

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Code Quality**: ESLint (implicit via CRA)
- **Environment Management**: .env files

---

## 📁 Project Structure

```
Multi-Tenant-SaaS-Platform-with-Project-Task-Management/
│
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js    # PostgreSQL connection pool
│   │   ├── controllers/       # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── tenantController.js
│   │   │   ├── userController.js
│   │   │   ├── projectController.js
│   │   │   ├── taskController.js
│   │   │   └── healthController.js
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.js       # JWT authentication
│   │   │   ├── tenantContext.js  # Tenant isolation
│   │   │   ├── requestLogger.js  # HTTP logging
│   │   │   └── validation.js     # Input validation
│   │   ├── models/           # Data access layer (functional)
│   │   │   ├── Tenant.js
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   ├── Task.js
│   │   │   └── AuditLog.js
│   │   ├── routes/           # API route definitions
│   │   │   ├── auth.js
│   │   │   ├── tenants.js
│   │   │   ├── users.js
│   │   │   ├── projects.js
│   │   │   ├── tasks.js
│   │   │   └── health.js
│   │   └── server.js         # Express app entry point
│   ├── migrations/           # SQL database migrations
│   │   ├── 001_create_tenants.sql
│   │   ├── 002_create_users.sql
│   │   ├── 003_create_projects.sql
│   │   ├── 004_create_tasks.sql
│   │   └── 005_create_audit_logs.sql
│   ├── seeds/               # Demo data seeding
│   │   └── seed.js
│   ├── Dockerfile           # Backend container image
│   ├── .dockerignore
│   ├── .env                 # Environment variables (local dev)
│   └── package.json
│
├── frontend/                # React SPA
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── Layout.js
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/          # Page components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Projects.js
│   │   │   ├── ProjectDetail.js
│   │   │   └── Users.js
│   │   ├── services/       # API service layer
│   │   │   ├── api.js      # Axios instance with interceptors
│   │   │   ├── authService.js
│   │   │   ├── projectService.js
│   │   │   ├── taskService.js
│   │   │   └── userService.js
│   │   ├── App.js          # Root component with routing
│   │   └── index.js        # React entry point
│   ├── nginx.conf          # Nginx production config
│   ├── Dockerfile          # Frontend container image
│   ├── .dockerignore
│   └── package.json
│
├── docs/                   # Documentation
│   ├── API.md             # Complete API reference
│   └── images/
│       ├── architecture-diagram.md  # System architecture
│       └── database-erd.md          # Database schema diagram
│
├── docker-compose.yml     # Multi-container orchestration
├── .env.example           # Environment variables template
├── submission.json        # Test credentials for evaluation
├── README.md              # This file
└── package.json           # Root package.json (workspace)
```

---

## 🔧 Installation & Setup

### Prerequisites

- **Docker** 24.0+ and **Docker Compose** 2.0+ (for containerized deployment)
- **Node.js** 18+ and **npm** 9+ (for local development)
- **PostgreSQL** 15+ (for local development without Docker)
- **Git** 2.30+

---

### Docker Deployment (Recommended)

**Step 1: Clone Repository**

```bash
git clone <repository-url>
cd Multi-Tenant-SaaS-Platform-with-Project-Task-Management
```

**Step 2: Configure Environment**

```bash
# Copy example environment file
cp .env.example backend/.env

# Edit if needed (defaults work for Docker)
# Default values:
# DB_HOST=database
# DB_PORT=5432
# DB_NAME=saas_platform
# DB_USER=postgres
# DB_PASSWORD=postgres123
# JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Step 3: Build and Run**

```bash
# Build and start all services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f
```

**Step 4: Verify Deployment**

```bash
# Test backend health
curl http://localhost:5000/api/health

# Test frontend (browser)
open http://localhost:3000
```

**Step 5: Login with Test Account**

1. Navigate to http://localhost:3000
2. Click "Login"
3. Enter:
   - **Tenant Subdomain**: `acmecorp`
   - **Email**: `admin@acmecorp.com`
   - **Password**: `password123`
4. Explore dashboard, projects, and tasks

**Docker Commands Reference**

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build

# View real-time logs
docker-compose logs -f backend

# Execute command in backend container
docker-compose exec backend npm run migrate

# Access PostgreSQL shell
docker-compose exec database psql -U postgres -d saas_platform
```

---

### Local Development

For development without Docker:

**Step 1: Install PostgreSQL**

```bash
# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-15
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

**Step 2: Create Database**

```bash
# Access PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE saas_platform;
CREATE USER postgres WITH PASSWORD 'postgres123';
GRANT ALL PRIVILEGES ON DATABASE saas_platform TO postgres;
\q
```

**Step 3: Setup Backend**

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Edit .env for local PostgreSQL
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=saas_platform
# DB_USER=postgres
# DB_PASSWORD=postgres123
# JWT_SECRET=your-jwt-secret
# PORT=5000

# Run migrations
npm run migrate

# Seed demo data
npm run seed

# Start development server
npm run dev
```

Backend will run on http://localhost:5000

**Step 4: Setup Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run on http://localhost:3000

**Development Workflow**

```bash
# Backend hot reload (nodemon)
cd backend
npm run dev

# Frontend hot reload (CRA)
cd frontend
npm start

# Run migrations after schema changes
cd backend
npm run migrate

# Reset database (drop and recreate)
npm run migrate:reset
```

---

## 📚 API Documentation

Complete API reference available at: **[docs/API.md](docs/API.md)**

### API Overview

**Base URL**: `http://localhost:5000/api`

**Authentication**: 
```
Authorization: Bearer <jwt-token>
```

**Tenant Context** (where applicable):
```
X-Tenant-ID: <tenant-id>
```

### Quick Reference

#### Authentication
- `POST /api/auth/register` - Register new tenant
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

#### Tenants (Super Admin)
- `GET /api/tenants` - List all tenants
- `GET /api/tenants/:id` - Get tenant details
- `PUT /api/tenants/:id` - Update tenant

#### Users
- `POST /api/users` - Create user (Admin)
- `GET /api/users` - List users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)

#### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/project/:projectId` - List project tasks
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task

#### System
- `GET /api/health` - Health check

### Example Request

**Create Project**

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer <token>" \
  -H "X-Tenant-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign",
    "description": "Complete company website overhaul",
    "status": "active"
  }'
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "tenant_id": 1,
    "name": "Website Redesign",
    "description": "Complete company website overhaul",
    "status": "active",
    "created_by": 1,
    "created_at": "2024-01-20T10:00:00.000Z"
  }
}
```

---

## 🗄️ Database Schema

**Full ERD**: See [docs/images/database-erd.md](docs/images/database-erd.md)

### Tables Overview

#### tenants
- Stores organization information
- Subscription tier and limits
- Subdomain for tenant identification

#### users
- User accounts scoped to tenants
- Password hashing with bcrypt
- Role-based access control

#### projects
- Project management per tenant
- Status tracking (active, archived, completed)
- Created by user reference

#### tasks
- Task tracking within projects
- Assignment to users
- Priority and status workflow
- Due date management

#### audit_logs
- Complete activity trail
- Tenant-isolated logging
- JSONB metadata for flexibility

### Key Relationships

```
tenants (1) ──< (N) users
tenants (1) ──< (N) projects
projects (1) ──< (N) tasks
users (1) ──< (N) tasks (assigned)
users (1) ──< (N) projects (creator)
```

---

## 🏢 Multi-Tenancy Implementation

### Shared Schema Architecture

All tenants share the same database tables with `tenant_id` discrimination:

**Advantages**:
- Lower infrastructure costs
- Simplified maintenance and backups
- Easier migrations across all tenants
- Efficient resource utilization

**Implementation**:

1. **Tenant Identification** (Login)
   ```javascript
   // User provides subdomain during login
   POST /api/auth/login
   {
     "email": "admin@company.com",
     "password": "secret",
     "tenantSubdomain": "company"
   }
   ```

2. **JWT Token with Tenant**
   ```javascript
   // Token payload includes tenant_id
   {
     "userId": 1,
     "tenantId": 2,
     "role": "tenant_admin",
     "iat": 1234567890,
     "exp": 1234654290
   }
   ```

3. **Middleware Injection**
   ```javascript
   // tenantContext middleware extracts tenant_id
   const tenantContext = (req, res, next) => {
     req.tenantId = req.user.tenantId; // From JWT
     next();
   };
   ```

4. **Data Isolation**
   ```javascript
   // All queries filter by tenant_id
   const projects = await pool.query(
     'SELECT * FROM projects WHERE tenant_id = $1',
     [req.tenantId]
   );
   ```

### Subscription Limits

Enforced at controller level before resource creation:

```javascript
// Check user limit
const tenant = await Tenant.findById(tenantId);
const userCount = await User.countByTenant(tenantId);
if (userCount >= tenant.max_users) {
  return res.status(403).json({
    success: false,
    message: 'User limit reached for your subscription'
  });
}
```

**Default Limits**:
- **Free**: 5 users, 10 projects
- **Pro**: 15 users, 25 projects
- **Enterprise**: Unlimited (set high limits)

---

## 🔒 Security

### Authentication

**JWT Implementation**:
- Token expiry: 24 hours
- Algorithm: HS256 (HMAC SHA-256)
- Secret: Environment variable `JWT_SECRET`
- Storage: Frontend localStorage

**Password Security**:
- Hashing: bcrypt with 10 salt rounds
- No plain text storage
- Password requirements: 8+ characters

### Authorization

**Role Hierarchy**:

1. **super_admin** - Cross-tenant access, tenant management
2. **tenant_admin** - Full tenant access, user management
3. **user** - Limited access to assigned resources

### Data Protection

1. **SQL Injection Prevention** - Parameterized queries only
2. **XSS Protection** - React's built-in escaping
3. **CORS Configuration** - Restricted origins
4. **Input Validation** - express-validator on all inputs
5. **Rate Limiting** - TODO for production

---

## 🧪 Testing

### Manual Testing with Docker

```bash
# 1. Start services
docker-compose up -d

# 2. Test health endpoint
curl http://localhost:5000/api/health

# 3. Login with test account
# Frontend: http://localhost:3000
# Subdomain: acmecorp
# Email: admin@acmecorp.com
# Password: password123
```

### API Testing with curl

See [docs/API.md](docs/API.md) for complete examples.

---

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set strong `JWT_SECRET`
   - Configure production database credentials
   - Set `NODE_ENV=production`

2. **Database**
   - Use managed PostgreSQL (AWS RDS, DigitalOcean)
   - Run migrations
   - Set up automated backups

3. **Security**
   - Enable HTTPS/SSL
   - Add rate limiting
   - Configure CSP headers
   - Use secrets management

4. **Monitoring**
   - Add application monitoring (Sentry, Datadog)
   - Set up logging aggregation
   - Configure alerts

---

## 🐛 Troubleshooting

### Common Issues

**1. Docker containers won't start**
```bash
docker-compose logs -f
docker-compose down -v && docker-compose up -d
```

**2. Database connection errors**
```bash
docker-compose exec backend env | grep DB_
```

**3. Frontend can't connect to backend**
- Check CORS configuration
- Verify backend is running on port 5000
- Check browser console for errors

**4. "User limit reached" error**
```sql
UPDATE tenants SET max_users = 50 WHERE subdomain = 'acmecorp';
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

- **Documentation**: [docs/API.md](docs/API.md)
- **Architecture**: [docs/images/architecture-diagram.md](docs/images/architecture-diagram.md)
- **Database**: [docs/images/database-erd.md](docs/images/database-erd.md)

---

**Built with ❤️ for the SaaS community**

*Last Updated: December 2024*
