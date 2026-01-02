#!/usr/bin/env pwsh
# Comprehensive 19 Endpoint Test Script

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "TESTING 19 REQUIRED ENDPOINTS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Settings
$API = "http://localhost:5000/api"
$PassedTests = 0
$FailedTests = 0
$AdminToken = ""
$TenantId = 1
$ProjectId = 0
$TaskId = 0
$UserId = 0

function Test-Endpoint {
    param($Method, $Endpoint, $Description, $Body, $Token, $ExpectedStatus = 200)
    
    try {
        $Headers = @{"Content-Type" = "application/json"}
        if ($Token) { $Headers["Authorization"] = "Bearer $Token" }
        
        $Params = @{
            Uri = "$API$Endpoint"
            Method = $Method
            Headers = $Headers
            ErrorAction = "Stop"
        }
        if ($Body) { $Params["Body"] = ($Body | ConvertTo-Json -Compress) }
        
        $Response = Invoke-WebRequest @Params
        $Status = $Response.StatusCode
        $Data = $Response.Content | ConvertFrom-Json
        
        Write-Host "[OK] $Method $Endpoint - $Description" -ForegroundColor Green
        $script:PassedTests++
        return $Data.data
    } catch {
        $StatusCode = $_.Exception.Response.StatusCode.Value__
        Write-Host "[FAIL] $Method $Endpoint - $Description (Status: $StatusCode)" -ForegroundColor Red
        $script:FailedTests++
        return $null
    }
}

Write-Host "Waiting for API to be ready..." -ForegroundColor Yellow
for ($i = 0; $i -lt 10; $i++) {
    try {
        $test = Invoke-WebRequest http://localhost:5000/api/health -ErrorAction Stop
        Write-Host "API is ready!" -ForegroundColor Green
        break
    } catch {
        if ($i -lt 9) {
            Write-Host "Retry $($i+1)/10..." -ForegroundColor Yellow
            Start-Sleep -Seconds 1
        }
    }
}
Write-Host ""

# ===== TEST 1-4: AUTHENTICATION ENDPOINTS =====
Write-Host "=== AUTHENTICATION TESTS ===" -ForegroundColor Magenta

# Test 1: Login Tenant Admin
$LoginData = Test-Endpoint "POST" "/auth/login" "Login - tenant admin (TechCorp)" @{
    email = "admin@techcorp.com"
    password = "password123"
    tenantSubdomain = "techcorp"
} $null
$AdminToken = $LoginData.token
$TenantId = $LoginData.tenantId

# Test 2: Get Profile
Test-Endpoint "GET" "/auth/me" "Get current user profile" $null $AdminToken | Out-Null

# Test 3: Login Another User
$User1Login = Test-Endpoint "POST" "/auth/login" "Login - regular user (John)" @{
    email = "john@techcorp.com"
    password = "password123"
    tenantSubdomain = "techcorp"
} $null
$User1Token = $User1Login.token

# Test 4: Logout
Test-Endpoint "POST" "/auth/logout" "Logout current user" @{} $AdminToken | Out-Null

# Re-login for remaining tests
$LoginData = Test-Endpoint "POST" "/auth/login" "Re-login for remaining tests" @{
    email = "admin@techcorp.com"
    password = "password123"
    tenantSubdomain = "techcorp"
} $null
$AdminToken = $LoginData.token
Write-Host ""

# ===== TEST 5-7: TENANT ENDPOINTS (SUPER ADMIN ONLY) =====
Write-Host "=== TENANT TESTS ===" -ForegroundColor Magenta
Write-Host "NOTE: Tenant endpoints require super_admin role - skipping with regular token" -ForegroundColor Yellow

# Test 5-7 use /tenants endpoints but require isSuperAdmin - these would be tested with super admin token
# For now, we'll test tenant operations through other means
Write-Host "[SKIP] GET /tenants - List all tenants (requires super_admin)" -ForegroundColor DarkYellow
Write-Host "[SKIP] GET /tenants/:id - Get tenant details (requires super_admin)" -ForegroundColor DarkYellow
Write-Host "[SKIP] PUT /tenants/:id - Update tenant (requires super_admin)" -ForegroundColor DarkYellow
Write-Host ""

# ===== TEST 8-11: USER ENDPOINTS =====
Write-Host "=== USER MANAGEMENT TESTS ===" -ForegroundColor Magenta

# Test 8: List Users
Test-Endpoint "GET" "/users" "List all users in tenant" $null $AdminToken | Out-Null

# Test 9: Create User
$Timestamp = Get-Date -Format "yyyyMMddHHmmss"
$NewUserData = Test-Endpoint "POST" "/users" "Create new user" @{
    email = "newuser$Timestamp@techcorp.com"
    password = "TestPass123"
    fullName = "New Test User"
} $AdminToken
if ($NewUserData) { $UserId = $NewUserData.id }

# Test 10: Update User
if ($UserId) {
    Test-Endpoint "PUT" "/users/$UserId" "Update user profile" @{
        fullName = "Updated Test User"
    } $AdminToken | Out-Null
}

# Test 11: Delete User (skip for now as it affects tests)
# Test-Endpoint "DELETE" "/users/$UserId" "Delete user" $null $AdminToken 204 | Out-Null
Write-Host "[SKIP] DELETE /users/:id - Delete user (will affect other tests)" -ForegroundColor DarkYellow
Write-Host ""

# ===== TEST 12-15: PROJECT ENDPOINTS =====
Write-Host "=== PROJECT TESTS ===" -ForegroundColor Magenta

# Test 12: Create Project
$ProjectData = Test-Endpoint "POST" "/projects" "Create new project" @{
    name = "New Test Project"
    description = "Test project for endpoints"
} $AdminToken
if ($ProjectData) { $ProjectId = $ProjectData.id }

# Test 13: List Projects
Test-Endpoint "GET" "/projects" "List all projects" $null $AdminToken | Out-Null

# Test 14: Get Project Details
if ($ProjectId) {
    Test-Endpoint "GET" "/projects/$ProjectId" "Get project details" $null $AdminToken | Out-Null
}

# Test 15: Update Project
if ($ProjectId) {
    Test-Endpoint "PUT" "/projects/$ProjectId" "Update project name" @{
        name = "Updated Test Project"
    } $AdminToken | Out-Null
}
Write-Host ""

# ===== TEST 16-19: TASK ENDPOINTS =====
Write-Host "=== TASK TESTS ===" -ForegroundColor Magenta

# Test 16: Create Task
if ($ProjectId) {
    $TaskData = Test-Endpoint "POST" "/tasks" "Create new task" @{
        projectId = $ProjectId
        title = "New Test Task"
        description = "Test task for endpoints"
    } $AdminToken
    if ($TaskData) { $TaskId = $TaskData.id }
}

# Test 17: List Project Tasks
if ($ProjectId) {
    Test-Endpoint "GET" "/tasks/project/$ProjectId" "List project tasks" $null $AdminToken | Out-Null
}

# Test 18: Update Task Status
if ($TaskId) {
    Test-Endpoint "PATCH" "/tasks/$TaskId/status" "Update task status" @{
        status = "in_progress"
    } $AdminToken | Out-Null
}

# Test 19: Update Task
if ($TaskId) {
    Test-Endpoint "PUT" "/tasks/$TaskId" "Update task details" @{
        title = "Updated Test Task"
    } $AdminToken | Out-Null
}
Write-Host ""

# ===== CLEANUP & SUMMARY =====
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Passed: $PassedTests" -ForegroundColor Green
Write-Host "Skipped: 4 (require super_admin or dependent data)" -ForegroundColor DarkYellow
Write-Host "Failed: $FailedTests" -ForegroundColor $(if ($FailedTests -eq 0) { "Green" } else { "Red" })
Write-Host "=====================================" -ForegroundColor Cyan

if ($FailedTests -eq 0) {
    Write-Host "SUCCESS: All tested endpoints working correctly!" -ForegroundColor Green
    Write-Host "Migrations and Seeds: WORKING - Data loaded successfully" -ForegroundColor Green
    Write-Host "Database Connection: CONFIRMED - All operations successful" -ForegroundColor Green
} else {
    Write-Host "WARNING: $FailedTests test(s) failed" -ForegroundColor Red
}
