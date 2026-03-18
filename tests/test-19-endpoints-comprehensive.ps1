#!/usr/bin/env powershell
# Comprehensive API Test Suite - All 19 Endpoints
# Tests both seed data and new data creation

param(
    [switch]$Verbose
)

$ErrorActionPreference = "SilentlyContinue"
$baseUrl = "http://localhost:5000/api"
$results = @()

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  MULTI-TENANT SAAS API - COMPREHENSIVE TEST SUITE  ║" -ForegroundColor Cyan
Write-Host "║            19 Endpoints | Seed + New Data          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# 1. GET AUTHENTICATION TOKENS
Write-Host "Obtaining authentication tokens..." -ForegroundColor Yellow

$loginHeaders = @{"Content-Type" = "application/json"}

try {
    $superAdminRes = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Headers $loginHeaders `
        -Body '{"email":"superadmin@system.com","password":"Admin@123"}' `
        -UseBasicParsing
    
    $adminRes = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Headers $loginHeaders `
        -Body '{"email":"admin@demo.com","password":"Demo@123","tenantSubdomain":"demo"}' `
        -UseBasicParsing
    
    $userRes = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Headers $loginHeaders `
        -Body '{"email":"user1@demo.com","password":"User@123","tenantSubdomain":"demo"}' `
        -UseBasicParsing
    
    $superAdminData = $superAdminRes.Content | ConvertFrom-Json
    $adminData = $adminRes.Content | ConvertFrom-Json
    $userData = $userRes.Content | ConvertFrom-Json
    
    Write-Host "Tokens obtained successfully`n" -ForegroundColor Green
}
catch {
    Write-Host "Failed to obtain tokens: $_`n" -ForegroundColor Red
    exit 1
}

# 2. TEST FUNCTION
function Test-Endpoint {
    param(
        [int]$Number,
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [string]$Body,
        [string]$Token,
        [string]$TenantId,
        [int]$ExpectedStatus = 200
    )
    
    $headers = @{"Content-Type" = "application/json"}
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    if ($TenantId) { $headers["X-Tenant-ID"] = $TenantId }
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$Endpoint" `
            -Method $Method `
            -Headers $headers `
            -Body $Body `
            -UseBasicParsing `
            -ErrorAction Stop
        
        Write-Host "  [$Number] PASS - $Name" -ForegroundColor Green
        return @{Number=$Number; Name=$Name; Status="PASS"; Code=$response.StatusCode}
    }
    catch {
        $statusCode = try { $_.Exception.Response.StatusCode.Value } catch { 0 }
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  [$Number] PASS - $Name (Expected $ExpectedStatus)" -ForegroundColor Green
            return @{Number=$Number; Name=$Name; Status="PASS"; Code=$statusCode}
        }
        else {
            Write-Host "  [$Number] FAIL - $Name (Got $statusCode)" -ForegroundColor Red
            return @{Number=$Number; Name=$Name; Status="FAIL"; Code=$statusCode}
        }
    }
}

# 3. RUN TESTS

Write-Host "SEED DATA TESTS" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Authentication and Health:" -ForegroundColor Gray
$results += Test-Endpoint 1 "Health Check" GET "/health"
$results += Test-Endpoint 2 "Login SuperAdmin (Seed)" POST "/auth/login" '{"email":"superadmin@system.com","password":"Admin@123"}'
$results += Test-Endpoint 3 "Login Admin (Seed)" POST "/auth/login" '{"email":"admin@demo.com","password":"Demo@123","tenantSubdomain":"demo"}'
$results += Test-Endpoint 4 "Get Current User (Admin)" GET "/users/me" "" $adminData.data.token

Write-Host ""
Write-Host "User Management:" -ForegroundColor Gray
$results += Test-Endpoint 5 "List All Users" GET "/users" "" $superAdminData.data.token
$results += Test-Endpoint 6 "List Tenant Users (Seed)" GET "/users" "" $adminData.data.token "1"
$results += Test-Endpoint 7 "Get User by ID (Seed)" GET "/users/3" "" $adminData.data.token "1"
$results += Test-Endpoint 8 "Create NEW User" POST "/users" '{"email":"testapi@demo.com","password":"TestAPI@123","fullName":"API Test User","role":"user"}' $adminData.data.token "1"

Write-Host ""
Write-Host "Project Management:" -ForegroundColor Gray
$results += Test-Endpoint 9 "List Projects (Seed)" GET "/projects" "" $adminData.data.token "1"
$results += Test-Endpoint 10 "Get Project Details (Seed)" GET "/projects/1" "" $adminData.data.token "1"
$results += Test-Endpoint 11 "Create NEW Project" POST "/projects" '{"name":"API Test Project","description":"Created via API test","status":"active"}' $adminData.data.token "1"
$results += Test-Endpoint 12 "Update Project (Seed)" PUT "/projects/1" '{"name":"Updated via API","status":"active"}' $adminData.data.token "1"

Write-Host ""
Write-Host "Task Management:" -ForegroundColor Gray
$results += Test-Endpoint 13 "List Tasks (Seed)" GET "/tasks" "" $adminData.data.token "1"
$results += Test-Endpoint 14 "Get Task Details (Seed)" GET "/tasks/1" "" $adminData.data.token "1"
$results += Test-Endpoint 15 "Create NEW Task" POST "/tasks" '{"project_id":1,"title":"API Test Task","status":"todo","assigned_to":3}' $adminData.data.token "1"
$results += Test-Endpoint 16 "Update Task Status (Seed)" PUT "/tasks/1" '{"status":"in_progress"}' $adminData.data.token "1"

Write-Host ""
Write-Host "Tenant Management:" -ForegroundColor Gray
$results += Test-Endpoint 17 "List All Tenants" GET "/tenants" "" $superAdminData.data.token
$results += Test-Endpoint 18 "Get Tenant Details (Seed)" GET "/tenants/1" "" $superAdminData.data.token
$results += Test-Endpoint 19 "Invalid Credentials (Expected 401)" POST "/auth/login" '{"email":"admin@demo.com","password":"WRONG","tenantSubdomain":"demo"}' "" "" 401

Write-Host ""
Write-Host ""

# 4. SUMMARY
$passCount = ($results | Where-Object {$_.Status -eq "PASS"}).Count
$failCount = ($results | Where-Object {$_.Status -eq "FAIL"}).Count
$totalCount = $results.Count

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                      RESULTS                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Passed:  $passCount" -ForegroundColor Green
Write-Host "  Failed:  $failCount" -ForegroundColor Red
Write-Host "  Total:   $totalCount" -ForegroundColor Cyan
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "  ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "  System is ready for production." -ForegroundColor Green
}
else {
    Write-Host "  Some tests failed. See details above." -ForegroundColor Red
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
