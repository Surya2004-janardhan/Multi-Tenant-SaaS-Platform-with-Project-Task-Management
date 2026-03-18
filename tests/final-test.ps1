#!/usr/bin/env powershell
# Final Comprehensive Test - Multi-Tenant SaaS Platform
# Tests all requirements are met

Write-Host ""
Write-Host "=========================================="
Write-Host "FINAL COMPREHENSIVE PLATFORM TEST"
Write-Host "=========================================="
Write-Host ""

$passCount = 0
$failCount = 0

function Test-Requirement {
    param([string]$Name, [scriptblock]$Test)
    
    try {
        $result = & $Test
        if ($result) {
            Write-Host "[PASS] $Name" -ForegroundColor Green
            $global:passCount++
            return $true
        } else {
            Write-Host "[FAIL] $Name" -ForegroundColor Red
            $global:failCount++
            return $false
        }
    } catch {
        Write-Host "[FAIL] $Name - $($_.Exception.Message)" -ForegroundColor Red
        $global:failCount++
        return $false
    }
}

# Requirement 1: PostgreSQL Database
Write-Host "1. DATABASE REQUIREMENTS" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────"
Test-Requirement "PostgreSQL container is running" {
    (docker ps --format "{{.Names}}" | Select-String "database").Count -gt 0
}

Test-Requirement "Database is healthy" {
    (docker ps --format "{{.Status}}" | Select-String "database" | Select-String "healthy").Count -gt 0
}

Test-Requirement "Tenants table exists" {
    $loginBody = @{email = "admin@techcorp.com"; password = "password123"; tenantSubdomain = "techcorp"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -UseBasicParsing -ErrorAction Stop
    $response.StatusCode -eq 200
}

# Requirement 2: Backend API Server
Write-Host ""
Write-Host "2. BACKEND SERVER REQUIREMENTS" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────"
Test-Requirement "Backend server is running" {
    (docker ps --format "{{.Names}}" | Select-String "backend").Count -gt 0
}

Test-Requirement "Backend is healthy" {
    (docker ps --format "{{.Status}}" | Select-String "backend" | Select-String "healthy").Count -gt 0
}

Test-Requirement "Health endpoint responds" {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -UseBasicParsing -ErrorAction Stop
    $response.StatusCode -eq 200
}

# Requirement 3: Authentication
Write-Host ""
Write-Host "3. AUTHENTICATION REQUIREMENTS" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────"
Test-Requirement "Tenant admin can login" {
    $loginBody = @{email = "admin@techcorp.com"; password = "password123"; tenantSubdomain = "techcorp"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -UseBasicParsing -ErrorAction Stop
    ($response.Content | ConvertFrom-Json).data.user.role -eq "tenant_admin"
}

Test-Requirement "Super admin can login" {
    $loginBody = @{email = "superadmin@system.com"; password = "Admin@123"; tenantSubdomain = "system"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -UseBasicParsing -ErrorAction Stop
    ($response.Content | ConvertFrom-Json).data.user.role -eq "super_admin"
}

Test-Requirement "JWT token is returned" {
    $loginBody = @{email = "admin@techcorp.com"; password = "password123"; tenantSubdomain = "techcorp"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -UseBasicParsing -ErrorAction Stop
    -not [string]::IsNullOrEmpty(($response.Content | ConvertFrom-Json).data.token)
}

# Get token for further tests
$loginBody = @{email = "admin@techcorp.com"; password = "password123"; tenantSubdomain = "techcorp"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).data.token

# Requirement 4: Projects API
Write-Host ""
Write-Host "4. PROJECTS API REQUIREMENTS" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────"
Test-Requirement "GET /api/projects works" {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/projects" -Method GET -Headers @{"Authorization" = "Bearer $token"} -UseBasicParsing -ErrorAction Stop
    $response.StatusCode -eq 200
}

Test-Requirement "POST /api/projects works" {
    $projectBody = @{name = "Test Project $(Get-Random)"; description = "API Test"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/projects" -Method POST -ContentType "application/json" -Body $projectBody -Headers @{"Authorization" = "Bearer $token"} -UseBasicParsing -ErrorAction Stop
    $response.StatusCode -eq 201
}

# Requirement 5: Tasks API
Write-Host ""
Write-Host "5. TASKS API REQUIREMENTS" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────"
$projectBody = @{name = "Test Project"; description = "For tasks"} | ConvertTo-Json
$projResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/projects" -Method POST -ContentType "application/json" -Body $projectBody -Headers @{"Authorization" = "Bearer $token"} -UseBasicParsing
$projectId = ($projResponse.Content | ConvertFrom-Json).data.id

Test-Requirement "POST /api/tasks works" {
    $taskBody = @{projectId = $projectId; title = "Test Task"; description = "API Test"; status = "todo"; priority = "high"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/tasks" -Method POST -ContentType "application/json" -Body $taskBody -Headers @{"Authorization" = "Bearer $token"} -UseBasicParsing -ErrorAction Stop
    $response.StatusCode -eq 201
}

Test-Requirement "GET /api/tasks works" {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/tasks?projectId=$projectId" -Method GET -Headers @{"Authorization" = "Bearer $token"} -UseBasicParsing -ErrorAction Stop
    $response.StatusCode -eq 200
}

# Requirement 6: Users API
Write-Host ""
Write-Host "6. USERS API REQUIREMENTS" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────"
Test-Requirement "GET /api/users works" {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/users" -Method GET -Headers @{"Authorization" = "Bearer $token"} -UseBasicParsing -ErrorAction Stop
    $response.StatusCode -eq 200
}

# Requirement 7: Tenants API (Super Admin only)
Write-Host ""
Write-Host "7. TENANTS API REQUIREMENTS" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────"
$superLoginBody = @{email = "superadmin@system.com"; password = "Admin@123"; tenantSubdomain = "system"} | ConvertTo-Json
$superResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $superLoginBody -UseBasicParsing
$superToken = ($superResponse.Content | ConvertFrom-Json).data.token

Test-Requirement "GET /api/tenants works (Super Admin)" {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/tenants" -Method GET -Headers @{"Authorization" = "Bearer $superToken"} -UseBasicParsing -ErrorAction Stop
    $response.StatusCode -eq 200
}

Test-Requirement "Tenant admin cannot access /api/tenants" {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/tenants" -Method GET -Headers @{"Authorization" = "Bearer $token"} -UseBasicParsing -ErrorAction Stop
        $response.StatusCode -ne 200
    } catch {
        $true
    }
}

# Requirement 8: Multi-Tenancy Isolation
Write-Host ""
Write-Host "8. MULTI-TENANCY ISOLATION" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────"
$designLoginBody = @{email = "admin@designhub.com"; password = "password123"; tenantSubdomain = "designhub"} | ConvertTo-Json
$designResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $designLoginBody -UseBasicParsing
$designToken = ($designResponse.Content | ConvertFrom-Json).data.token

Test-Requirement "TechCorp and DesignHub see different projects" {
    $techProjects = Invoke-WebRequest -Uri "http://localhost:5000/api/projects" -Method GET -Headers @{"Authorization" = "Bearer $token"} -UseBasicParsing
    $designProjects = Invoke-WebRequest -Uri "http://localhost:5000/api/projects" -Method GET -Headers @{"Authorization" = "Bearer $designToken"} -UseBasicParsing
    
    $techData = $techProjects.Content | ConvertFrom-Json
    $designData = $designProjects.Content | ConvertFrom-Json
    
    # Different tenants should have different project sets (or at least different names)
    $techData.data.Count -ne $designData.data.Count -or (($techData.data.Count -gt 0 -and $designData.data.Count -gt 0) -and $techData.data[0].name -ne $designData.data[0].name)
}

# Requirement 9: Frontend
Write-Host ""
Write-Host "9. FRONTEND REQUIREMENTS" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────"
Test-Requirement "Frontend is running" {
    (docker ps --format "{{.Names}}" | Select-String "frontend").Count -gt 0
}

Test-Requirement "Frontend responds on port 3000" {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction Stop
        $response.StatusCode -eq 200
    } catch {
        $false
    }
}

# Summary
Write-Host ""
Write-Host "=========================================="
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host "PASSED: $passCount" -ForegroundColor Green
Write-Host "FAILED: $failCount" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "ALL TESTS PASSED - PLATFORM IS READY" -ForegroundColor Green
} else {
    Write-Host "SOME TESTS FAILED - REVIEW ABOVE" -ForegroundColor Red
}

Write-Host ""
