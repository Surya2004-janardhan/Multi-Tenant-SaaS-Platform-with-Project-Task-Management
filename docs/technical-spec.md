# Technical Specification Document

**Project:** Multi-Tenant SaaS Platform with Project & Task Management  
**Version:** 1.0  
**Date:** December 22, 2025  
**Audience:** Developers, DevOps Engineers

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Technology Stack Details](#technology-stack-details)
3. [Development Setup Guide](#development-setup-guide)
4. [Database Setup](#database-setup)
5. [Docker Setup](#docker-setup)
6. [Development Workflow](#development-workflow)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Guide](#deployment-guide)

---

## Project Structure

### Complete Directory Layout

```
Multi-Tenant-SaaS-Platform-with-Project-Task-Management/
│
├── 📁 backend/                          # Backend API server
│   ├── 📁 src/
│   │   ├── 📁 config/                   # Configuration files
│   │   │   ├── database.js              # PostgreSQL connection setup
│   │   │   ├── jwt.js                   # JWT configuration
│   │   │   └── cors.js                  # CORS settings
│   │   │
│   │   ├── 📁 controllers/              # Request handlers
│   │   │   ├── authController.js        # Authentication endpoints
│   │   │   ├── tenantController.js      # Tenant management
│   │   │   ├── userController.js        # User CRUD operations
│   │   │   ├── projectController.js     # Project management
│   │   │   └── taskController.js        # Task operations
│   │   │
│   │   ├── 📁 middleware/               # Express middleware
│   │   │   ├── auth.js                  # JWT verification
│   │   │   ├── authorize.js             # Role-based authorization
│   │   │   ├── tenantContext.js         # Inject tenant_id from JWT
│   │   │   ├── validation.js            # Input validation middleware
│   │   │   └── errorHandler.js          # Global error handling
│   │   │
│   │   ├── 📁 models/                   # Database models/queries
│   │   │   ├── tenantModel.js           # Tenant DB operations
│   │   │   ├── userModel.js             # User DB operations
│   │   │   ├── projectModel.js          # Project DB operations
│   │   │   ├── taskModel.js             # Task DB operations
│   │   │   └── auditModel.js            # Audit log operations
│   │   │
│   │   ├── 📁 routes/                   # API route definitions
│   │   │   ├── authRoutes.js            # Auth endpoints
│   │   │   ├── tenantRoutes.js          # Tenant endpoints
│   │   │   ├── userRoutes.js            # User endpoints
│   │   │   ├── projectRoutes.js         # Project endpoints
│   │   │   ├── taskRoutes.js            # Task endpoints
│   │   │   └── index.js                 # Route aggregator
│   │   │
│   │   ├── 📁 services/                 # Business logic services
│   │   │   ├── auditService.js          # Audit logging
│   │   │   ├── hashService.js           # Password hashing (bcrypt)
│   │   │   ├── tokenService.js          # JWT generation/validation
│   │   │   └── subscriptionService.js   # Limit checking
│   │   │
│   │   ├── 📁 utils/                    # Utility functions
│   │   │   ├── validators.js            # Input validation helpers
│   │   │   ├── helpers.js               # Common utilities
│   │   │   └── constants.js             # App-wide constants
│   │   │
│   │   └── index.js                     # Express app entry point
│   │
│   ├── 📁 migrations/                   # Database migrations
│   │   ├── 001_create_tenants.sql       # Tenants table
│   │   ├── 002_create_users.sql         # Users table
│   │   ├── 003_create_projects.sql      # Projects table
│   │   ├── 004_create_tasks.sql         # Tasks table
│   │   ├── 005_create_audit_logs.sql    # Audit logs table
│   │   └── run-migrations.js            # Migration runner script
│   │
│   ├── 📁 seeds/                        # Seed data
│   │   ├── seed_data.sql                # Initial data (super admin, demo tenant)
│   │   └── run-seeds.js                 # Seed runner script
│   │
│   ├── 📁 tests/                        # Test files
│   │   ├── auth.test.js                 # Auth endpoint tests
│   │   ├── tenants.test.js              # Tenant tests
│   │   ├── users.test.js                # User tests
│   │   ├── projects.test.js             # Project tests
│   │   └── tasks.test.js                # Task tests
│   │
│   ├── .env.example                     # Environment variables template
│   ├── .env                             # Actual environment variables (gitignored in production)
│   ├── .gitignore                       # Git ignore rules
│   ├── package.json                     # Node dependencies
│   ├── package-lock.json                # Locked dependency versions
│   └── Dockerfile                       # Docker image definition
│
├── 📁 frontend/                         # React frontend application
│   ├── 📁 public/
│   │   ├── index.html                   # HTML template
│   │   ├── favicon.ico                  # Site icon
│   │   └── manifest.json                # PWA manifest
│   │
│   ├── 📁 src/
│   │   ├── 📁 assets/                   # Static assets
│   │   │   ├── 📁 images/               # Images, logos
│   │   │   └── 📁 styles/               # Global CSS
│   │   │       ├── global.css           # Global styles
│   │   │       └── variables.css        # CSS variables
│   │   │
│   │   ├── 📁 components/               # React components
│   │   │   ├── 📁 common/               # Reusable components
│   │   │   │   ├── Button.jsx           # Button component
│   │   │   │   ├── Input.jsx            # Input field
│   │   │   │   ├── Card.jsx             # Card container
│   │   │   │   ├── Badge.jsx            # Status badges
│   │   │   │   ├── Spinner.jsx          # Loading spinner
│   │   │   │   └── ErrorMessage.jsx     # Error display
│   │   │   │
│   │   │   ├── 📁 auth/                 # Authentication components
│   │   │   │   ├── LoginForm.jsx        # Login form
│   │   │   │   ├── RegisterForm.jsx     # Registration form
│   │   │   │   └── PrivateRoute.jsx     # Protected route guard
│   │   │   │
│   │   │   ├── 📁 layout/               # Layout components
│   │   │   │   ├── Navbar.jsx           # Top navigation bar
│   │   │   │   ├── Sidebar.jsx          # Side navigation
│   │   │   │   ├── Footer.jsx           # Footer
│   │   │   │   └── MainLayout.jsx       # Main layout wrapper
│   │   │   │
│   │   │   └── 📁 modals/               # Modal dialogs
│   │   │       ├── CreateProjectModal.jsx
│   │   │       ├── EditProjectModal.jsx
│   │   │       ├── CreateTaskModal.jsx
│   │   │       ├── EditTaskModal.jsx
│   │   │       └── AddUserModal.jsx
│   │   │
│   │   ├── 📁 pages/                    # Page components
│   │   │   ├── LoginPage.jsx            # Login page
│   │   │   ├── RegisterPage.jsx         # Registration page
│   │   │   ├── DashboardPage.jsx        # Main dashboard
│   │   │   ├── ProjectsPage.jsx         # Projects list
│   │   │   ├── ProjectDetailsPage.jsx   # Single project view
│   │   │   └── UsersPage.jsx            # User management (admin)
│   │   │
│   │   ├── 📁 services/                 # API service layer
│   │   │   ├── api.js                   # Axios instance config
│   │   │   ├── authService.js           # Auth API calls
│   │   │   ├── tenantService.js         # Tenant API calls
│   │   │   ├── userService.js           # User API calls
│   │   │   ├── projectService.js        # Project API calls
│   │   │   └── taskService.js           # Task API calls
│   │   │
│   │   ├── 📁 context/                  # React Context
│   │   │   └── AuthContext.jsx          # Authentication state
│   │   │
│   │   ├── 📁 hooks/                    # Custom React hooks
│   │   │   ├── useAuth.js               # Authentication hook
│   │   │   ├── useApi.js                # API call hook
│   │   │   └── useDebounce.js           # Debounce hook
│   │   │
│   │   ├── 📁 utils/                    # Utility functions
│   │   │   ├── validators.js            # Form validation
│   │   │   ├── formatters.js            # Date/time formatting
│   │   │   └── constants.js             # Constants
│   │   │
│   │   ├── App.jsx                      # Root component
│   │   ├── index.jsx                    # Entry point
│   │   └── setupTests.js                # Test configuration
│   │
│   ├── .env.example                     # Environment template
│   ├── .env                             # Environment variables
│   ├── .gitignore                       # Git ignore rules
│   ├── package.json                     # Dependencies
│   ├── package-lock.json                # Locked versions
│   └── Dockerfile                       # Docker image
│
├── 📁 docs/                             # Documentation
│   ├── 📁 images/                       # Diagrams and screenshots
│   │   ├── system-architecture.png      # Architecture diagram
│   │   └── database-erd.png             # Database ERD
│   │
│   ├── research.md                      # Research document
│   ├── PRD.md                           # Product requirements
│   ├── architecture.md                  # System architecture
│   ├── technical-spec.md                # This document
│   └── API.md                           # API documentation
│
├── 📁 database/                         # Alternative migration location
│   ├── 📁 migrations/                   # (Can use instead of backend/migrations)
│   └── 📁 seeds/                        # (Can use instead of backend/seeds)
│
├── docker-compose.yml                   # Docker orchestration
├── .gitignore                           # Root gitignore
├── README.md                            # Project README
└── submission.json                      # Test credentials for evaluation
```

### Purpose of Each Directory

**Backend:**

- **config/**: Environment-specific configuration (database URL, JWT secret)
- **controllers/**: Handle HTTP requests, validate input, call services, return responses
- **middleware/**: Intercept requests for auth, validation, logging
- **models/**: Database query functions (CRUD operations)
- **routes/**: Map HTTP methods and paths to controllers
- **services/**: Business logic (hashing, token generation, audit logging)
- **utils/**: Helper functions used across the app
- **migrations/**: SQL files to create database schema
- **seeds/**: SQL files to populate initial data

**Frontend:**

- **components/**: Reusable UI pieces (buttons, forms, cards)
- **pages/**: Full page components tied to routes
- **services/**: API communication layer (axios calls)
- **context/**: Global state management (user authentication)
- **hooks/**: Custom React hooks for common patterns
- **utils/**: Helper functions (validation, formatting)

---

## Technology Stack Details

### Backend Stack

| Technology            | Version  | Purpose               | Installation                    |
| --------------------- | -------- | --------------------- | ------------------------------- |
| **Node.js**           | 18.x LTS | JavaScript runtime    | `node -v`                       |
| **Express.js**        | 4.18.x   | Web framework         | `npm install express`           |
| **PostgreSQL**        | 15.x     | Database              | `psql --version`                |
| **pg**                | 8.11.x   | PostgreSQL client     | `npm install pg`                |
| **bcryptjs**          | 2.4.x    | Password hashing      | `npm install bcryptjs`          |
| **jsonwebtoken**      | 9.0.x    | JWT auth              | `npm install jsonwebtoken`      |
| **dotenv**            | 16.3.x   | Environment variables | `npm install dotenv`            |
| **uuid**              | 9.0.x    | UUID generation       | `npm install uuid`              |
| **cors**              | 2.8.x    | CORS middleware       | `npm install cors`              |
| **express-validator** | 7.0.x    | Input validation      | `npm install express-validator` |

**Dev Dependencies:**

- **nodemon**: Auto-restart server on file changes
- **jest**: Testing framework
- **supertest**: HTTP API testing

### Frontend Stack

| Technology       | Version | Purpose             | Installation                    |
| ---------------- | ------- | ------------------- | ------------------------------- |
| **React**        | 18.2.x  | UI library          | `npx create-react-app frontend` |
| **React Router** | 6.20.x  | Client-side routing | `npm install react-router-dom`  |
| **Axios**        | 1.6.x   | HTTP client         | `npm install axios`             |

### DevOps Stack

| Technology         | Version | Purpose                       |
| ------------------ | ------- | ----------------------------- |
| **Docker**         | 24.x    | Containerization              |
| **Docker Compose** | 2.x     | Multi-container orchestration |
| **Git**            | 2.x     | Version control               |

---

## Development Setup Guide

### Prerequisites

Before starting, ensure you have installed:

1. **Node.js 18.x LTS**

   - Download: https://nodejs.org/
   - Verify: `node -v` should show v18.x.x

2. **PostgreSQL 15.x**

   - Download: https://www.postgresql.org/download/
   - Verify: `psql --version` should show 15.x

3. **Git**

   - Download: https://git-scm.com/
   - Verify: `git --version`

4. **Docker & Docker Compose** (for containerization)

   - Download: https://www.docker.com/get-started
   - Verify: `docker --version` and `docker-compose --version`

5. **Code Editor**
   - Recommended: VS Code with extensions (ESLint, Prettier)

### Local Development Setup (Without Docker)

#### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/multi-tenant-saas-platform.git
cd multi-tenant-saas-platform
```

#### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your settings
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=saas_db
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_jwt_secret_key_min_32_chars
# PORT=5000
# FRONTEND_URL=http://localhost:3000
```

#### Step 3: Database Setup

```bash
# Create database (run in terminal or PostgreSQL client)
createdb saas_db

# Or using psql:
psql -U postgres
CREATE DATABASE saas_db;
\q

# Run migrations to create tables
npm run migrate

# Run seeds to populate initial data
npm run seed

# Verify tables were created
psql -U postgres -d saas_db
\dt
# Should see: tenants, users, projects, tasks, audit_logs
\q
```

#### Step 4: Start Backend Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start

# Server should start on http://localhost:5000
# Check health: curl http://localhost:5000/api/health
```

#### Step 5: Frontend Setup

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start development server
npm start

# Frontend should open at http://localhost:3000
```

#### Step 6: Verify Setup

1. **Backend Health Check:**

   ```bash
   curl http://localhost:5000/api/health
   # Should return: {"status":"ok","database":"connected"}
   ```

2. **Test Login:**

   - Open http://localhost:3000
   - Login with seed credentials:
     - Email: `admin@demo.com`
     - Password: `Demo@123`
     - Subdomain: `demo`

3. **Check Database:**
   ```bash
   psql -U postgres -d saas_db
   SELECT * FROM tenants;
   SELECT * FROM users;
   \q
   ```

---

## Database Setup

### Manual Database Creation

If migrations fail or you prefer manual setup:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE saas_db;

-- Connect to database
\c saas_db

-- Create tenants table
CREATE TABLE tenants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(63) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    subscription_plan VARCHAR(20) DEFAULT 'free',
    max_users INTEGER DEFAULT 5,
    max_projects INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

-- Create indexes
CREATE INDEX idx_users_tenant ON users(tenant_id);

-- (Continue with projects, tasks, audit_logs tables...)
```

### Migration Script Structure

**backend/migrations/run-migrations.js:**

```javascript
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runMigrations() {
  const migrationDir = path.join(__dirname);
  const files = fs
    .readdirSync(migrationDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    console.log(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationDir, file), "utf8");
    await pool.query(sql);
    console.log(`✓ ${file} completed`);
  }

  await pool.end();
  console.log("All migrations completed!");
}

runMigrations().catch(console.error);
```

### Seed Data Script

**backend/seeds/seed_data.sql:**

```sql
-- Insert super admin (tenant_id is NULL)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
VALUES (
  'super-admin-uuid',
  NULL,
  'superadmin@system.com',
  '$2a$10$hashedpasswordhere', -- Hash of "Admin@123"
  'Super Admin',
  'super_admin'
);

-- Insert demo tenant
INSERT INTO tenants (id, name, subdomain, status, subscription_plan)
VALUES (
  'demo-tenant-uuid',
  'Demo Company',
  'demo',
  'active',
  'pro'
);

-- Insert demo tenant admin
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
VALUES (
  'demo-admin-uuid',
  'demo-tenant-uuid',
  'admin@demo.com',
  '$2a$10$hashedpasswordhere', -- Hash of "Demo@123"
  'Demo Admin',
  'tenant_admin'
);

-- (Continue with more seed data...)
```

---

## Docker Setup

### Docker Compose Configuration

**docker-compose.yml:**

```yaml
version: "3.8"

services:
  # PostgreSQL Database
  database:
    image: postgres:15
    container_name: database
    environment:
      POSTGRES_DB: saas_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build: ./backend
    container_name: backend
    ports:
      - "5000:5000"
    environment:
      DB_HOST: database
      DB_PORT: 5432
      DB_NAME: saas_db
      DB_USER: postgres
      DB_PASSWORD: postgres
      JWT_SECRET: multi_tenant_saas_jwt_secret_key_2024_development_only
      FRONTEND_URL: http://frontend:3000
      PORT: 5000
    depends_on:
      database:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Frontend React App
  frontend:
    build: ./frontend
    container_name: frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://backend:5000/api
    depends_on:
      backend:
        condition: service_healthy

volumes:
  db_data:
```

### Backend Dockerfile

**backend/Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Run migrations and seeds on startup, then start server
CMD ["sh", "-c", "npm run migrate && npm run seed && npm start"]
```

### Frontend Dockerfile

**frontend/Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Serve with simple HTTP server
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
```

### Running with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
```

---

## Development Workflow

### Daily Development Routine

1. **Start Development Servers:**

   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm start
   ```

2. **Make Code Changes:**

   - Backend: Edit files in `backend/src/`
   - Frontend: Edit files in `frontend/src/`
   - Servers auto-reload on save

3. **Test Changes:**

   - Manual testing in browser
   - Run unit tests: `npm test`
   - Check API with Postman or curl

4. **Commit Changes:**
   ```bash
   git add .
   git commit -m "feat: add task filtering"
   git push origin main
   ```

### Code Style Guidelines

**JavaScript/React:**

- Use ES6+ syntax (arrow functions, destructuring)
- Async/await for promises (not .then())
- Functional components with hooks (not class components)
- Meaningful variable names (camelCase)
- Keep functions small (< 50 lines)
- Add comments for complex logic

**File Naming:**

- Components: PascalCase (e.g., `UserCard.jsx`)
- Services: camelCase (e.g., `authService.js`)
- Routes: camelCase (e.g., `authRoutes.js`)

---

## Testing Strategy

### Backend Testing

**Setup:**

```bash
cd backend
npm install --save-dev jest supertest
```

**Example Test (backend/tests/auth.test.js):**

```javascript
const request = require("supertest");
const app = require("../src/index");

describe("Authentication API", () => {
  test("POST /api/auth/register-tenant - success", async () => {
    const response = await request(app).post("/api/auth/register-tenant").send({
      tenantName: "Test Company",
      subdomain: "testco",
      adminEmail: "admin@testco.com",
      adminPassword: "Test@123",
      adminFullName: "Test Admin",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("tenantId");
  });

  test("POST /api/auth/login - valid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "admin@demo.com",
      password: "Demo@123",
      tenantSubdomain: "demo",
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("token");
  });
});
```

**Run Tests:**

```bash
npm test
```

### Frontend Testing

**Setup:**

```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**Example Test:**

```javascript
import { render, screen } from "@testing-library/react";
import LoginPage from "./pages/LoginPage";

test("renders login form", () => {
  render(<LoginPage />);
  expect(screen.getByText(/login/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
});
```

---

## Deployment Guide

### Production Checklist

- [ ] Environment variables set (no defaults)
- [ ] JWT secret is strong (32+ characters)
- [ ] Database backups configured
- [ ] HTTPS enabled (TLS certificate)
- [ ] CORS restricted to production domain
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Health checks working
- [ ] Docker images built and tested

### Environment Variables for Production

**Backend (.env):**

```bash
DB_HOST=production-db.example.com
DB_PORT=5432
DB_NAME=saas_db_prod
DB_USER=saas_user
DB_PASSWORD=strong_password_here
JWT_SECRET=very_strong_secret_key_min_32_characters_random
JWT_EXPIRES_IN=24h
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://app.yourplatform.com
```

**Frontend (.env):**

```bash
REACT_APP_API_URL=https://api.yourplatform.com/api
```

### Deployment Steps

1. **Build Docker Images:**

   ```bash
   docker-compose build
   ```

2. **Push to Registry:**

   ```bash
   docker tag backend:latest registry.example.com/backend:latest
   docker push registry.example.com/backend:latest
   ```

3. **Deploy to Server:**

   ```bash
   # SSH to server
   ssh user@yourserver.com

   # Pull images
   docker-compose pull

   # Start services
   docker-compose up -d

   # Check logs
   docker-compose logs -f
   ```

4. **Verify Deployment:**
   ```bash
   curl https://api.yourplatform.com/api/health
   ```

---

## Troubleshooting

### Common Issues

**Issue: Database connection failed**

- Check PostgreSQL is running: `systemctl status postgresql`
- Verify credentials in .env match database
- Check database exists: `psql -l`

**Issue: Frontend can't reach backend**

- Check CORS settings allow frontend domain
- Verify backend is running: `curl http://localhost:5000/api/health`
- Check REACT_APP_API_URL in frontend .env

**Issue: JWT token invalid**

- Check JWT_SECRET is same in backend .env
- Verify token hasn't expired (24h default)
- Check clock sync on server

**Issue: Docker container won't start**

- Check logs: `docker-compose logs backend`
- Verify environment variables set
- Check database is healthy: `docker-compose ps`

---

## Additional Resources

### Documentation

- Express.js: https://expressjs.com/
- React: https://react.dev/
- PostgreSQL: https://www.postgresql.org/docs/
- Docker: https://docs.docker.com/

### Tools

- Postman: API testing
- pgAdmin: PostgreSQL GUI
- VS Code: Code editor
- Git: Version control

---

**Document Version:** 1.0  
**Last Updated:** December 22, 2025  
**Maintained By:** Development Team  
**Next Review:** January 15, 2026
