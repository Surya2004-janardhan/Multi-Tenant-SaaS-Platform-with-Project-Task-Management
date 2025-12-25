# 🚀 Quick Start Guide - Local Development

## ✅ FIXED: Backend-Frontend Connection Configuration

### What Was Fixed:
1. **CORS Configuration**: Changed FRONTEND_URL from `http://frontend:3000` to `http://localhost:3000`
2. **Frontend .env**: Confirmed REACT_APP_API_URL points to `http://localhost:5000/api`
3. **All API endpoint paths verified** - Frontend and Backend are perfectly aligned

---

## 🔧 Step-by-Step Startup

### 1. Start Backend Server

```powershell
# Open Terminal 1 (PowerShell)
cd backend
npm install
node src/index.js
```

**Expected Output:**
```
==============================================
🚀 Server running on port 5000
📝 Environment: development
🔗 API URL: http://localhost:5000/api
==============================================
```

**Verify Backend is Running:**
```powershell
# In another terminal
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2025-12-24T...",
    "database": "connected"
  }
}
```

---

### 2. Start Frontend Application

```powershell
# Open Terminal 2 (PowerShell)
cd frontend
npm install
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view multi-tenant-saas-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**Browser will auto-open to:** `http://localhost:3000`

---

## 🧪 Testing the Connection

### Test 1: Health Check (Browser)
Open: `http://localhost:5000/api/health`

Should see:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected"
  }
}
```

### Test 2: Login from Frontend
1. Go to: `http://localhost:3000/login`
2. Enter credentials:
   - **Email**: `admin@techcorp.com`
   - **Password**: `password123`
   - **Subdomain**: `techcorp`
3. Click "Login"

**Check Browser Console (F12):**
You should see:
```
🔵 API Request: POST http://localhost:5000/api/auth/login
🟢 API Response: status 200
```

### Test 3: Backend Logs
In the backend terminal, you should see:
```
🔵 [POST] /api/auth/login
🟢 200 - POST /api/auth/login - 123ms
```

---

## 🔍 Troubleshooting

### Backend Not Receiving Requests?

**Check 1: Is backend running on port 5000?**
```powershell
netstat -an | findstr :5000
```
Should show: `TCP 0.0.0.0:5000 ... LISTENING`

**Check 2: CORS Configuration**
In `backend/.env`, verify:
```
FRONTEND_URL=http://localhost:3000
```

**Check 3: Frontend API URL**
In `frontend/.env`, verify:
```
REACT_APP_API_URL=http://localhost:5000/api
```

**Check 4: Browser Console**
Open DevTools (F12) → Network tab → Try logging in
- Look for requests to `localhost:5000`
- Check for CORS errors (red text)

### Common Issues:

**❌ CORS Error: "Access-Control-Allow-Origin"**
**Fix:** Restart backend server after changing `.env`

**❌ Network Error: "Failed to fetch"**
**Fix:** Make sure backend is running on port 5000

**❌ 404 Not Found**
**Fix:** Check endpoint paths in frontend services

---

## ✅ Configuration Summary

### Backend (.env)
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://neondb_owner:...
JWT_SECRET=multi_tenant_saas_jwt_secret_key_2024_development_only
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
PORT=3000
```

### API Endpoint Mapping
All endpoints verified in `ENDPOINT_VERIFICATION.md`

---

## 🎯 Test Credentials

### Super Admin
- Email: `superadmin@system.com`
- Password: `Admin@123`

### TechCorp Tenant
- Subdomain: `techcorp`
- Admin: `admin@techcorp.com` / `password123`
- User: `john@techcorp.com` / `password123`

### DesignHub Tenant
- Subdomain: `designhub`
- Admin: `admin@designhub.com` / `password123`
- User: `mike@designhub.com` / `password123`

### AcmeCorp Tenant
- Subdomain: `acmecorp`
- Admin: `admin@acmecorp.com` / `password123`
- User: `developer@acmecorp.com` / `password123`

---

## 🔥 Quick Test Command

```powershell
# Test backend health
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@techcorp.com\",\"password\":\"password123\",\"tenantSubdomain\":\"techcorp\"}'
```

---

**✅ All configurations are now correct for local development!**

**Next Steps:**
1. Start backend: `cd backend && node src/index.js`
2. Start frontend: `cd frontend && npm start`
3. Open browser: `http://localhost:3000`
4. Login with test credentials above
