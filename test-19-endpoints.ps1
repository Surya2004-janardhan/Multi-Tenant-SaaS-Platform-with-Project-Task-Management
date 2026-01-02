#!/usr/bin/env pwsh
# Comprehensive 19-Endpoint Testing Script for Multi-Tenant SaaS Platform

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MULTI-TENANT SAAS - 19 ENDPOINT TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# SETUP
# ============================================================
$API_URL = "http://localhost:5000/api"
$SUPER_ADMIN_EMAIL = "superadmin@system.com"
$SUPER_ADMIN_PASSWORD = "Admin@123"
$DEMO_ADMIN_EMAIL = "admin@demo.com"
$DEMO_ADMIN_PASSWORD = "Demo@123"
$DEMO_USER_EMAIL = "user1@demo.com"
$DEMO_USER_PASSWORD = "User@123"
$DEMO_SUBDOMAIN = "demo"

$SuperAdminToken = ""
$DemoAdminToken = ""
$DemoUserToken = ""
$DemoTenantId = 1
$DemoProjectId = 0
$DemoTaskId = 0

$PassedTests = 0
$FailedTests = 0

function Test-Endpoint {
    param(
        [string]$EndpointNum,
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [object]$Body = $null,
        [string]$Token = $null,
        [int]$ExpectedStatus = 200,
        [string]$TokenVar = ""
    )
    
    try {
        $Headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $Headers["Authorization"] = "Bearer $Token"
        }
        
        $Params = @{
            Uri     = "$API_URL$Endpoint"
            Method  = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $Params["Body"] = ($Body | ConvertTo-Json)
        }
        
        $Response = Invoke-WebRequest @Params -ErrorAction Stop
        $Status = $Response.StatusCode
        $Content = $Response.Content | ConvertFrom-Json
        
        if ($Status -eq $ExpectedStatus) {
            Write-Host "✓ [API $EndpointNum] $Method $Endpoint - $Description" -ForegroundColor Green
            Write-Host "   Status: $Status" -ForegroundColor Gray
            
            # Store tokens for later use
            if ($TokenVar -eq "SuperAdminToken" -and $Content.data.token) {
                $script:SuperAdminToken = $Content.data.token
            }
            if ($TokenVar -eq "DemoAdminToken" -and $Content.data.token) {
                $script:DemoAdminToken = $Content.data.token
            }
            if ($TokenVar -eq "DemoUserToken" -and $Content.data.token) {
                $script:DemoUserToken = $Content.data.token
            }
            
            # Store IDs for later use
            if ($Content.data.tenantId) {
                $script:DemoTenantId = $Content.data.tenantId
            }
            if ($Content.data.id -and $Method -eq "POST" -and $Endpoint -like "*projects*" -and -not $Endpoint.Contains("/tasks")) {
                $script:DemoProjectId = $Content.data.id
            }
            if ($Content.data.id -and $Method -eq "POST" -and $Endpoint -like "*tasks*") {
                $script:DemoTaskId = $Content.data.id
            }
            
            $script:PassedTests++
            return $true
        } else {
            Write-Host "✗ [API $EndpointNum] $Method $Endpoint - Expected $ExpectedStatus, got $Status" -ForegroundColor Red
            Write-Host "   Response: $($Content | ConvertTo-Json)" -ForegroundColor Red
            $script:FailedTests++
            return $false
        }
    } catch {
        Write-Host "✗ [API $EndpointNum] $Method $Endpoint - ERROR" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:FailedTests++
        return $false
    }
}

# ============================================================
# WAIT FOR SERVICE
# ============================================================
Write-Host "Waiting for API to be ready..." -ForegroundColor Yellow
$MaxAttempts = 30
$Attempt = 0
while ($Attempt -lt $MaxAttempts) {
    try {
        $Health = Invoke-WebRequest "$API_URL/health" -ErrorAction Stop
        Write-Host "✓ API is ready!" -ForegroundColor Green
        break
    } catch {
        $Attempt++
        if ($Attempt -eq $MaxAttempts) {
            Write-Host "✗ API failed to start after $MaxAttempts attempts" -ForegroundColor Red
            exit 1
        }
        Write-Host "   Attempt $Attempt/$MaxAttempts - Waiting..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTING ALL 19 ENDPOINTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# AUTH ENDPOINTS (4)
# ============================================================
Write-Host "--- AUTHENTICATION ENDPOINTS (4) ---" -ForegroundColor Magenta

# API 1: POST /api/auth/login (Super Admin)
Test-Endpoint "1" "POST" "/auth/login" `
    "Login Super Admin" `
    @{
        email = $SUPER_ADMIN_EMAIL
        password = $SUPER_ADMIN_PASSWORD
        tenantSubdomain = "system"
    } `
    -ExpectedStatus 200 `
    -TokenVar "SuperAdminToken"

# API 2: POST /api/auth/login (Demo Tenant Admin)
Test-Endpoint "2" "POST" "/auth/login" `
    "Login Demo Tenant Admin" `
    @{
        email = $DEMO_ADMIN_EMAIL
        password = $DEMO_ADMIN_PASSWORD
        tenantSubdomain = $DEMO_SUBDOMAIN
    } `
    -ExpectedStatus 200 `
    -TokenVar "DemoAdminToken"

# API 3: GET /api/auth/me (Get Current User)
Test-Endpoint "3" "GET" "/auth/me" `
    "Get Current User Profile" `
    -Token $DemoAdminToken `
    -ExpectedStatus 200

# API 4: POST /api/auth/logout
Test-Endpoint "4" "POST" "/auth/logout" `
    "Logout User" `
    -Token $DemoAdminToken `
    -ExpectedStatus 200

# Re-login for testing
Test-Endpoint "4B" "POST" "/auth/login" `
    "Re-login after logout" `
    @{
        email = $DEMO_ADMIN_EMAIL
        password = $DEMO_ADMIN_PASSWORD
        tenantSubdomain = $DEMO_SUBDOMAIN
    } `
    -ExpectedStatus 200 `
    -TokenVar "DemoAdminToken"

Write-Host ""
Write-Host "--- TENANT MANAGEMENT ENDPOINTS (3) ---" -ForegroundColor Magenta

# API 5: GET /api/tenants (Super Admin only)
Test-Endpoint "5" "GET" "/tenants" `
    "List All Tenants (Super Admin)" `
    -Token $SuperAdminToken `
    -ExpectedStatus 200

# API 6: GET /api/tenants/:id (Super Admin only)
Test-Endpoint "6" "GET" "/tenants/1" `
    "Get Tenant By ID (Super Admin)" `
    -Token $SuperAdminToken `
    -ExpectedStatus 200

# API 7: PUT /api/tenants/:id (Super Admin only)
Test-Endpoint "7" "PUT" "/tenants/1" `
    "Update Tenant (Super Admin)" `
    @{
        name = "Demo Company Updated"
    } `
    -Token $SuperAdminToken `
    -ExpectedStatus 200

Write-Host ""
Write-Host "--- USER MANAGEMENT ENDPOINTS (5) ---" -ForegroundColor Magenta

# API 8: POST /api/users (Create user - tenant admin only)
Test-Endpoint "8" "POST" "/users" `
    "Create New User (Tenant Admin)" `
    @{
        email = "newuser@demo.com"
        password = "NewUser@123"
        fullName = "New Test User"
        role = "user"
    } `
    -Token $DemoAdminToken `
    -ExpectedStatus 201

# API 9: GET /api/users (List tenant users)
Test-Endpoint "9" "GET" "/users" `
    "List Tenant Users" `
    -Token $DemoAdminToken `
    -ExpectedStatus 200

# API 10: GET /api/users/:id (Get user by ID)
Test-Endpoint "10" "GET" "/users/2" `
    "Get User By ID" `
    -Token $DemoAdminToken `
    -ExpectedStatus 200

# API 11: PUT /api/users/:id (Update user)
Test-Endpoint "11" "PUT" "/users/2" `
    "Update User" `
    @{
        fullName = "Updated Demo Admin"
    } `
    -Token $DemoAdminToken `
    -ExpectedStatus 200

# API 12: DELETE /api/users/:id (Delete user - use the new user we created)
Test-Endpoint "12" "DELETE" "/users/5" `
    "Delete User" `
    -Token $DemoAdminToken `
    -ExpectedStatus 200

Write-Host ""
Write-Host "--- PROJECT MANAGEMENT ENDPOINTS (5) ---" -ForegroundColor Magenta

# API 13: POST /api/projects (Create project)
Test-Endpoint "13" "POST" "/projects" `
    "Create New Project" `
    @{
        name = "Test Project"
        description = "A test project for API testing"
    } `
    -Token $DemoAdminToken `
    -ExpectedStatus 201

# API 14: GET /api/projects (List projects)
Test-Endpoint "14" "GET" "/projects" `
    "List Projects" `
    -Token $DemoAdminToken `
    -ExpectedStatus 200

# API 15: GET /api/projects/:id (Get project by ID)
Test-Endpoint "15" "GET" "/projects/1" `
    "Get Project By ID" `
    -Token $DemoAdminToken `
    -ExpectedStatus 200

# API 16: PUT /api/projects/:id (Update project)
Test-Endpoint "16" "PUT" "/projects/1" `
    "Update Project" `
    @{
        name = "Updated Project Alpha"
        description = "Updated description"
    } `
    -Token $DemoAdminToken `
    -ExpectedStatus 200

# API 17: DELETE /api/projects/:id (We'll test with the test project we created - ID 3)
Test-Endpoint "17" "DELETE" "/projects/3" `
    "Delete Project" `
    -Token $DemoAdminToken `
    -ExpectedStatus 200

Write-Host ""
Write-Host "--- TASK MANAGEMENT ENDPOINTS (4) ---" -ForegroundColor Magenta

# API 18: POST /api/tasks (Create task)
Test-Endpoint "18" "POST" "/tasks" `
    "Create New Task" `
    @{
        projectId = 1
        title = "Test Task"
        description = "A test task for API testing"
        priority = "high"
        assignedTo = 3
    } `
    -Token $DemoAdminToken `
    -ExpectedStatus 201

# API 19: GET /api/tasks/project/:projectId (Get project tasks)
Test-Endpoint "19" "GET" "/tasks/project/1" `
    "Get Project Tasks" `
    -Token $DemoAdminToken `
    -ExpectedStatus 200

# BONUS API 20: PUT /api/tasks/:id (Update task)
Test-Endpoint "20" "PUT" "/tasks/1" `
    "Update Task (Bonus)" `
    @{
        title = "Updated Task Title"
        status = "in_progress"
    } `
    -Token $DemoAdminToken `
    -ExpectedStatus 200

# BONUS API 21: PATCH /api/tasks/:id/status (Update task status)
Test-Endpoint "21" "PATCH" "/tasks/1/status" `
    "Update Task Status (Bonus)" `
    @{
        status = "completed"
    } `
    -Token $DemoAdminToken `
    -ExpectedStatus 200

# BONUS API 22: DELETE /api/tasks/:id (Delete task)
Test-Endpoint "22" "DELETE" "/tasks/6" `
    "Delete Task (Bonus)" `
    -Token $DemoAdminToken `
    -ExpectedStatus 200

Write-Host ""
Write-Host "--- HEALTH CHECK ENDPOINT (1) ---" -ForegroundColor Magenta

# API 23: GET /api/health
Test-Endpoint "23" "GET" "/health" `
    "Health Check" `
    -ExpectedStatus 200

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Passed: $PassedTests" -ForegroundColor Green
Write-Host "❌ Failed: $FailedTests" -ForegroundColor Red
Write-Host "📊 Total Tests Run: $($PassedTests + $FailedTests)" -ForegroundColor Cyan
Write-Host ""

if ($FailedTests -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! 🎉" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tested 19+ API endpoints with:" -ForegroundColor Green
    Write-Host "  [OK] Authentication (login, logout, profile)" -ForegroundColor Green
    Write-Host "  [OK] Tenant Management (CRUD)" -ForegroundColor Green
    Write-Host "  [OK] User Management (CRUD)" -ForegroundColor Green
    Write-Host "  [OK] Project Management (CRUD)" -ForegroundColor Green
    Write-Host "  [OK] Task Management (CRUD + Status)" -ForegroundColor Green
    Write-Host "  [OK] Health Check" -ForegroundColor Green
} else {
    Write-Host "WARNING: SOME TESTS FAILED" -ForegroundColor Red
}

Write-Host ""
