# 🚀 Quick Start Guide

## Backend Setup (5 minutes)

### 1. Install Dependencies

```powershell
cd backend
npm install
```

### 2. Setup PostgreSQL Database

```powershell
# Make sure PostgreSQL is running
# Create database
psql -U postgres -c "CREATE DATABASE saas_platform;"
```

### 3. Configure Environment

Create `backend/.env` file:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_platform
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=change_this_secret_key_in_production_min_32_chars
JWT_EXPIRES_IN=24h

FRONTEND_URL=http://localhost:5173
```

### 4. Run Database Migrations

```powershell
cd backend/database
node run-migrations.js
```

### 5. (Optional) Load Seed Data

```powershell
node run-seeds.js
```

### 6. Start Backend Server

```powershell
cd backend
npm run dev
```

Backend will be running at: **http://localhost:3000**

---

## Test the API

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Register a Tenant

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "My Company",
    "subdomain": "mycompany",
    "adminEmail": "admin@mycompany.com",
    "adminPassword": "SecurePass123!",
    "adminFullName": "Admin User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mycompany.com",
    "password": "SecurePass123!",
    "tenantSubdomain": "mycompany"
  }'
```

---

## Using Seed Data

If you ran the seed script, you can use these test accounts:

**TechCorp (subdomain: techcorp)**

- Email: `admin@techcorp.com`
- Password: `Password123!`

**DesignHub (subdomain: designhub)**

- Email: `admin@designhub.com`
- Password: `Password123!`

---

## API Endpoints Overview

- **Auth:** `/api/auth` - register, login, me, logout
- **Tenants:** `/api/tenants` - list, get, update (super admin only)
- **Users:** `/api/users` - create, list, update, delete
- **Projects:** `/api/projects` - CRUD operations
- **Tasks:** `/api/tasks` - CRUD operations + status updates
- **Health:** `/api/health` - Health check

Full API documentation in [backend/README.md](backend/README.md)

---

## Common Issues

### Database Connection Error

- Ensure PostgreSQL is running
- Check DB credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### Port Already in Use

- Change `PORT` in `.env` file
- Or kill process: `netstat -ano | findstr :3000`

### JWT Token Errors

- Ensure `JWT_SECRET` is set in `.env`
- Must be at least 32 characters long

---

## Project Structure

```
backend/
├── database/         # Migrations and seeds
├── src/
│   ├── config/       # Database, JWT, CORS config
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Auth, validation, errors
│   ├── models/       # Database operations
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── utils/        # Helpers and validators
│   └── index.js      # Server entry point
└── .env              # Environment variables
```

---

## Next Steps

1. ✅ Backend is running
2. 🎨 Setup Frontend (coming next)
3. 🐳 Docker configuration (optional)
4. 🧪 Testing (unit + integration)
5. 🚀 Deployment (production)

For detailed documentation, see:

- [Backend README](backend/README.md)
- [Architecture Documentation](docs/architecture.md)
- [Technical Specifications](docs/technical-spec.md)
