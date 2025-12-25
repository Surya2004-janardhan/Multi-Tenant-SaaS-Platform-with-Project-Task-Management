# API Endpoint Mapping - Frontend to Backend

## ✅ ALL ENDPOINTS VERIFIED AND ALIGNED

### Authentication Endpoints
| Frontend Call | Backend Route | Status |
|--------------|---------------|--------|
| POST /auth/register | POST /api/auth/register | ✅ Match |
| POST /auth/login | POST /api/auth/login | ✅ Match |
| GET /auth/me | GET /api/auth/me | ✅ Match |
| POST /auth/logout | POST /api/auth/logout | ✅ Match |

### User Endpoints
| Frontend Call | Backend Route | Status |
|--------------|---------------|--------|
| POST /users | POST /api/users | ✅ Match |
| GET /users | GET /api/users | ✅ Match |
| PUT /users/:id | PUT /api/users/:id | ✅ Match |
| DELETE /users/:id | DELETE /api/users/:id | ✅ Match |

### Project Endpoints
| Frontend Call | Backend Route | Status |
|--------------|---------------|--------|
| POST /projects | POST /api/projects | ✅ Match |
| GET /projects | GET /api/projects | ✅ Match |
| GET /projects/:id | GET /api/projects/:id | ✅ Match |
| PUT /projects/:id | PUT /api/projects/:id | ✅ Match |
| DELETE /projects/:id | DELETE /api/projects/:id | ✅ Match |

### Task Endpoints
| Frontend Call | Backend Route | Status |
|--------------|---------------|--------|
| POST /tasks | POST /api/tasks | ✅ Match |
| GET /tasks/project/:projectId | GET /api/tasks/project/:projectId | ✅ Match |
| GET /tasks/:id | GET /api/tasks/:id | ✅ Match |
| PUT /tasks/:id | PUT /api/tasks/:id | ✅ Match |
| PATCH /tasks/:id/status | PATCH /api/tasks/:id/status | ✅ Match |
| DELETE /tasks/:id | DELETE /api/tasks/:id | ✅ Match |

## Configuration Summary

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
PORT=3000
```

### Backend (.env)
```
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=<Neon PostgreSQL URL>
```

### CORS Configuration
- **Origin**: http://localhost:3000 (from FRONTEND_URL)
- **Credentials**: true
- **Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization, x-tenant-subdomain

## ✅ All endpoint paths are perfectly aligned!

The frontend services are calling exactly the right backend routes.
