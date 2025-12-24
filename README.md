# Multi-Tenant SaaS Platform - Project & Task Management System

A production-ready, fully dockerized multi-tenant SaaS application for project and task management with complete data isolation, role-based access control, and subscription management.

![Architecture](docs/images/system-architecture.png)

## 🌟 Features

- **Multi-Tenancy**: Complete data isolation between organizations with tenant-based access control
- **Authentication & Authorization**: JWT-based secure authentication with role-based permissions (Super Admin, Tenant Admin, User)
- **Project Management**: Create, update, and manage projects with team collaboration
- **Task Management**: Assign tasks, track progress, set priorities and due dates
- **User Management**: Invite team members, manage roles and permissions
- **Subscription Plans**: Free, Pro, and Enterprise plans with usage limits
- **Audit Logging**: Complete audit trail of all important actions
- **Responsive UI**: Mobile-friendly interface built with React and Tailwind CSS
- **Docker Support**: Fully containerized application with docker-compose
- **RESTful API**: 19 comprehensive API endpoints with proper documentation

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.18.x
- **Database**: PostgreSQL 15 (Alpine)
- **Authentication**: JSON Web Tokens (JWT) with bcryptjs
- **ORM/Query**: Native pg driver 8.11.x
- **Validation**: Custom middleware validation
- **Environment**: dotenv for configuration

### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.20.1
- **HTTP Client**: Axios 1.6.2
- **Styling**: Tailwind CSS 3.4.0
- **Build Tool**: Create React App / react-scripts 5.0.1
- **State Management**: React Context API

### DevOps & Infrastructure
- **Containerization**: Docker with Docker Compose
- **Web Server**: Nginx (for frontend)
- **Database Server**: PostgreSQL 15 Alpine
- **Process Manager**: Node.js native

## 📋 Prerequisites

- Docker Desktop (v20.10 or higher)
- Docker Compose (v2.0 or higher)
- Git
- 4GB RAM minimum
- 10GB disk space

**OR** for local development:
- Node.js 18.x or higher
- PostgreSQL 15.x
- npm or yarn

## 🚀 Quick Start with Docker (Recommended)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Multi-Tenant-SaaS-Platform-with-Project-Task-Management
```

### 2. Start All Services
```bash
docker-compose up -d
```

This single command will:
- Build and start PostgreSQL database (port 5432)
- Build and start backend API (port 5000)
- Build and start frontend application (port 3000)
- Run database migrations automatically
- Load seed data automatically

### 3. Verify Services
```bash
# Check all services are running
docker-compose ps

# Check backend health
curl http://localhost:5000/api/health

# Expected response:
# {"success":true,"message":"API is healthy","data":{"status":"healthy","database":"connected"}}
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### 5. Login with Test Credentials

**Super Admin:**
- Email: `superadmin@system.com`
- Password: `Admin@123`

**Tenant Admin (TechCorp):**
- Subdomain: `techcorp`
- Email: `admin@techcorp.com`
- Password: `password123`

**Regular User (TechCorp):**
- Subdomain: `techcorp`
- Email: `john@techcorp.com`
- Password: `password123`

### 6. Stop Services
```bash
docker-compose down
```

### 7. Stop and Remove All Data
```bash
docker-compose down -v
```

## 📦 Local Development Setup (Without Docker)

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

3. **Setup Database**
```bash
# Create database
createdb multi_tenant_saas

# Run migrations
node database/run-migrations.js

# Load seed data
node database/run-seeds.js
```

4. **Start Backend Server**
```bash
npm start
# Server runs on http://localhost:5000
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Configure Environment**
```bash
# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

3. **Start Frontend Development Server**
```bash
npm start
# App runs on http://localhost:3000
```

## 🗄️ Database Schema

The application uses a shared database with shared schema multi-tenancy pattern:

### Core Tables
- **tenants**: Organization information with subscription plans
- **users**: User accounts with role-based access
- **projects**: Projects owned by tenants
- **tasks**: Tasks within projects
- **audit_logs**: Audit trail of all actions

### Key Relationships
- Users belong to tenants (tenant_id foreign key)
- Projects belong to tenants (tenant_id foreign key)
- Tasks belong to both projects and tenants
- All tables (except super_admin users) are isolated by tenant_id

See [Database ERD](docs/images/database-erd.png) for visual representation.

## 🔐 Authentication & Authorization

### Roles
1. **Super Admin**: System-level administrator (tenant_id = NULL)
   - Access all tenants
   - Manage subscription plans
   - View all system data

2. **Tenant Admin**: Organization administrator
   - Manage users within their tenant
   - Create/update/delete projects
   - Manage tasks and assignments
   - Update tenant name

3. **User**: Regular team member
   - View projects and tasks
   - Update assigned tasks
   - Update own profile

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

## 📚 API Documentation

Complete API documentation with request/response examples: [API.md](docs/API.md)

### API Endpoints Summary (19 Total)

**Authentication (4 endpoints)**
- POST `/api/auth/register` - Register new tenant
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user
- POST `/api/auth/logout` - Logout

**Tenant Management (3 endpoints)**
- GET `/api/tenants` - List all tenants (super_admin only)
- GET `/api/tenants/:id` - Get tenant details
- PUT `/api/tenants/:id` - Update tenant

**User Management (4 endpoints)**
- POST `/api/users` - Create user
- GET `/api/users` - List users
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

**Project Management (4 endpoints)**
- POST `/api/projects` - Create project
- GET `/api/projects` - List projects
- PUT `/api/projects/:id` - Update project
- DELETE `/api/projects/:id` - Delete project

**Task Management (5 endpoints)**
- POST `/api/tasks` - Create task
- GET `/api/tasks/project/:id` - Get project tasks
- PATCH `/api/tasks/:id/status` - Update task status
- PUT `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task

**System (1 endpoint)**
- GET `/api/health` - Health check

## 🔒 Environment Variables

All required environment variables are documented in `.env.example`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=multi_tenant_saas
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000
```

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, validation, logging
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Helper functions
│   │   └── config/            # Configuration files
│   ├── database/
│   │   ├── migrations/        # SQL migration files
│   │   └── seeds/             # Seed data
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API clients
│   │   ├── context/           # React context
│   │   └── App.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docs/
│   ├── research.md            # Multi-tenancy research
│   ├── PRD.md                 # Product requirements
│   ├── architecture.md        # System architecture
│   ├── technical-spec.md      # Technical specification
│   └── API.md                 # API documentation
├── docker-compose.yml
├── submission.json            # Test credentials
└── README.md
```

## 🧪 Testing

### Test Credentials (from submission.json)

The application includes pre-seeded test data:

**Super Admin**
- Email: superadmin@system.com
- Password: Admin@123

**Tenants with Admin Users**
- TechCorp (subdomain: techcorp) - Pro plan
- DesignHub (subdomain: designhub) - Free plan
- AcmeCorp (subdomain: acmecorp) - Free plan

See `submission.json` for complete test credentials.

### Manual Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@techcorp.com",
    "password": "password123",
    "tenantSubdomain": "techcorp"
  }'

# Get projects (use token from login)
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-ID: YOUR_TENANT_ID"
```

## 🐛 Troubleshooting

### Docker Issues

**Services won't start:**
```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

**Database connection failed:**
```bash
# Check database is healthy
docker-compose ps
# Wait for health check to pass (may take 30-40 seconds)
```

**Port already in use:**
```bash
# Stop conflicting services or change ports in docker-compose.yml
```

### Application Issues

**Frontend can't reach backend:**
- Check CORS configuration in backend
- Verify REACT_APP_API_URL in frontend .env
- In Docker: Should use service name (http://backend:5000)
- In local dev: Should use localhost (http://localhost:5000)

**JWT token expired:**
- Tokens expire after 24 hours
- Login again to get new token

**Database migrations failed:**
- Check database logs: `docker-compose logs database`
- Manually run: `docker exec backend node database/run-migrations.js`

## 📊 Subscription Plans

| Plan | Max Users | Max Projects | Price |
|------|-----------|--------------|-------|
| Free | 3 | 5 | $0/month |
| Pro | 15 | 25 | $29/month |
| Enterprise | 50 | 100 | $99/month |

Limits are enforced at API level when creating users or projects.

## 🤝 Contributing

This is an educational project. Contributions for learning purposes are welcome!

## 📄 License

MIT License - feel free to use for learning and educational purposes.

## 📞 Support

For issues or questions:
1. Check the [API Documentation](docs/API.md)
2. Review [Architecture Document](docs/architecture.md)
3. Check logs: `docker-compose logs`

## 🎥 Demo Video

[Watch Demo Video on YouTube](https://youtube.com/your-video-link)

---

**Built with ❤️ for learning multi-tenant SaaS architecture**