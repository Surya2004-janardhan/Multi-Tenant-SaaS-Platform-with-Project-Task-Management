# API Documentation

## Base URL
- **Local Development**: `http://localhost:5000/api`
- **Docker**: `http://localhost:5000/api`

## Authentication
Most endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Some endpoints also require tenant context via header:
```
X-Tenant-ID: <tenant-id>
```

---

## Authentication Endpoints

### 1. Register Tenant
Register a new organization (tenant) with an admin user.

**Endpoint**: `POST /api/auth/register`  
**Authentication**: None (Public)

**Request Body**:
```json
{
  "tenantName": "Tech Solutions Inc",
  "subdomain": "techsolutions",
  "adminEmail": "admin@techsolutions.com",
  "adminPassword": "SecurePass@123",
  "adminFullName": "John Admin"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenant": {
      "id": 1,
      "name": "Tech Solutions Inc",
      "subdomain": "techsolutions"
    },
    "user": {
      "id": 1,
      "email": "admin@techsolutions.com",
      "fullName": "John Admin",
      "role": "tenant_admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400`: Validation errors
- `409`: Subdomain or email already exists

---

### 2. Login
User login with tenant subdomain.

**Endpoint**: `POST /api/auth/login`  
**Authentication**: None (Public)

**Request Body**:
```json
{
  "email": "admin@techcorp.com",
  "password": "password123",
  "tenantSubdomain": "techcorp"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@techcorp.com",
      "fullName": "Tech Admin",
      "role": "tenant_admin",
      "tenantId": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `401`: Invalid credentials
- `404`: Tenant not found
- `403`: Account suspended/inactive

---

### 3. Get Current User
Get authenticated user's profile information.

**Endpoint**: `GET /api/auth/me`  
**Authentication**: Required

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@techcorp.com",
    "fullName": "Tech Admin",
    "role": "tenant_admin",
    "tenantId": 1
  }
}
```

---

### 4. Logout
Logout current user.

**Endpoint**: `POST /api/auth/logout`  
**Authentication**: Required

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Tenant Management Endpoints

### 5. List All Tenants
Get list of all tenants (Super Admin only).

**Endpoint**: `GET /api/tenants`  
**Authentication**: Required (super_admin only)

**Query Parameters**:
- `page` (optional, default: 1)
- `limit` (optional, default: 10, max: 100)
- `status` (optional filter: active, suspended, trial)
- `subscriptionPlan` (optional filter: free, pro, enterprise)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": 1,
        "name": "TechCorp",
        "subdomain": "techcorp",
        "subscription_tier": "pro",
        "max_users": 15,
        "max_projects": 25,
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 3,
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "limit": 10
    }
  }
}
```

---

### 6. Get Tenant Details
Get details of a specific tenant.

**Endpoint**: `GET /api/tenants/:id`  
**Authentication**: Required (super_admin or same tenant user)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "TechCorp",
    "subdomain": "techcorp",
    "subscription_tier": "pro",
    "max_users": 15,
    "max_projects": 25,
    "created_at": "2024-01-15T10:00:00Z",
    "stats": {
      "totalUsers": 8,
      "totalProjects": 12,
      "totalTasks": 45
    }
  }
}
```

---

### 7. Update Tenant
Update tenant information.

**Endpoint**: `PUT /api/tenants/:id`  
**Authentication**: Required (tenant_admin or super_admin)

**Request Body** (All optional):
```json
{
  "name": "Updated Company Name",
  "subscription_tier": "enterprise"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Tenant updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Company Name",
    "subscription_tier": "enterprise",
    "updated_at": "2024-01-20T15:30:00Z"
  }
}
```

---

## User Management Endpoints

### 8. Create User
Add a new user to tenant.

**Endpoint**: `POST /api/users`  
**Authentication**: Required (tenant_admin)

**Headers**:
```
Authorization: Bearer <token>
X-Tenant-ID: <tenant-id>
```

**Request Body**:
```json
{
  "email": "newuser@techcorp.com",
  "password": "SecurePass@123",
  "fullName": "Jane Developer",
  "role": "user"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 5,
    "email": "newuser@techcorp.com",
    "fullName": "Jane Developer",
    "role": "user",
    "tenant_id": 1,
    "created_at": "2024-01-20T10:00:00Z"
  }
}
```

**Error Responses**:
- `403`: User limit reached
- `409`: Email already exists in tenant

---

### 9. List Users
Get all users in tenant.

**Endpoint**: `GET /api/users`  
**Authentication**: Required

**Query Parameters**:
- `search` (optional): Search by name or email
- `role` (optional filter): user, tenant_admin
- `page` (optional, default: 1)
- `limit` (optional, default: 50)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "tenant_id": 1,
        "email": "admin@techcorp.com",
        "full_name": "Tech Admin",
        "role": "tenant_admin",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 5,
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "limit": 50
    }
  }
}
```

---

### 10. Update User
Update user information.

**Endpoint**: `PUT /api/users/:id`  
**Authentication**: Required (tenant_admin or self)

**Request Body** (All optional):
```json
{
  "fullName": "Updated Name",
  "role": "tenant_admin"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 5,
    "fullName": "Updated Name",
    "role": "user",
    "updated_at": "2024-01-20T16:00:00Z"
  }
}
```

---

### 11. Delete User
Remove user from tenant.

**Endpoint**: `DELETE /api/users/:id`  
**Authentication**: Required (tenant_admin only)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses**:
- `403`: Cannot delete self or not authorized
- `404`: User not found

---

## Project Management Endpoints

### 12. Create Project
Create a new project.

**Endpoint**: `POST /api/projects`  
**Authentication**: Required

**Headers**:
```
Authorization: Bearer <token>
X-Tenant-ID: <tenant-id>
```

**Request Body**:
```json
{
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "status": "active"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tenant_id": 1,
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "status": "active",
    "created_by": 1,
    "created_at": "2024-01-20T10:00:00Z"
  }
}
```

**Error Responses**:
- `403`: Project limit reached

---

### 13. List Projects
Get all projects in tenant.

**Endpoint**: `GET /api/projects`  
**Authentication**: Required

**Query Parameters**:
- `status` (optional filter): active, archived, completed
- `search` (optional): Search by project name
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": 1,
        "name": "Website Redesign",
        "description": "Complete redesign",
        "status": "active",
        "task_count": 5,
        "completed_task_count": 2,
        "created_at": "2024-01-20T10:00:00Z"
      }
    ],
    "total": 3,
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "limit": 20
    }
  }
}
```

---

### 14. Update Project
Update project information.

**Endpoint**: `PUT /api/projects/:id`  
**Authentication**: Required (tenant_admin or project creator)

**Request Body** (All optional):
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "completed"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Project Name",
    "description": "Updated description",
    "status": "completed",
    "updated_at": "2024-01-22T14:00:00Z"
  }
}
```

---

### 15. Delete Project
Delete a project.

**Endpoint**: `DELETE /api/projects/:id`  
**Authentication**: Required (tenant_admin or project creator)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Task Management Endpoints

### 16. Create Task
Create a new task in a project.

**Endpoint**: `POST /api/tasks`  
**Authentication**: Required

**Request Body**:
```json
{
  "projectId": 1,
  "title": "Design homepage mockup",
  "description": "Create high-fidelity design for homepage",
  "priority": "high",
  "assignedTo": 5,
  "dueDate": "2024-02-15"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "project_id": 1,
    "tenant_id": 1,
    "title": "Design homepage mockup",
    "description": "Create high-fidelity design for homepage",
    "status": "todo",
    "priority": "high",
    "assigned_to": 5,
    "due_date": "2024-02-15",
    "created_by": 1,
    "created_at": "2024-01-20T10:00:00Z"
  }
}
```

---

### 17. List Project Tasks
Get all tasks for a project.

**Endpoint**: `GET /api/tasks/project/:projectId`  
**Authentication**: Required

**Query Parameters**:
- `status` (optional filter): todo, in_progress, done
- `assignedTo` (optional filter): user ID
- `priority` (optional filter): low, medium, high
- `search` (optional): Search by task title
- `page` (optional, default: 1)
- `limit` (optional, default: 50)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 1,
        "title": "Design homepage mockup",
        "description": "Create high-fidelity design",
        "status": "in_progress",
        "priority": "high",
        "assigned_to": {
          "id": 5,
          "full_name": "Jane Developer",
          "email": "jane@techcorp.com"
        },
        "due_date": "2024-02-15",
        "created_at": "2024-01-20T10:00:00Z"
      }
    ],
    "total": 5,
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "limit": 50
    }
  }
}
```

---

### 18. Update Task Status
Update only the status of a task.

**Endpoint**: `PATCH /api/tasks/:id/status`  
**Authentication**: Required

**Request Body**:
```json
{
  "status": "in_progress"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "in_progress",
    "updated_at": "2024-01-21T09:00:00Z"
  }
}
```

---

### 19. Update Task
Update task information (all fields).

**Endpoint**: `PUT /api/tasks/:id`  
**Authentication**: Required

**Request Body** (All optional):
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "done",
  "priority": "high",
  "assignedTo": 6,
  "dueDate": "2024-03-01"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "title": "Updated task title",
    "description": "Updated description",
    "status": "done",
    "priority": "high",
    "assigned_to": {
      "id": 6,
      "full_name": "John Doe",
      "email": "john@techcorp.com"
    },
    "due_date": "2024-03-01",
    "updated_at": "2024-01-22T10:00:00Z"
  }
}
```

---

### 20. Delete Task
Delete a task.

**Endpoint**: `DELETE /api/tasks/:id`  
**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## System Endpoints

### 21. Health Check
Check API and database health status.

**Endpoint**: `GET /api/health`  
**Authentication**: None (Public)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-20T10:30:00.000Z",
    "database": "connected"
  }
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Or with validation errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

---

**Last Updated**: December 2024  
**API Version**: 1.0.0
