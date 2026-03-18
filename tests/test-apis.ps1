# Comprehensive API Testing Script for Multi-Tenant SaaS Platform

Write-Host "TEST API ENDPOINTS"
Write-Host "====================================="
Write-Host ""

# Function to make API requests
function Invoke-ApiRequest {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [object]$Body = $null,
        [string]$Token = $null
    )
    
    $headers = @{"Content-Type" = "application/json"}
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params["Body"] = $Body | ConvertTo-Json -Depth 10
        }
        
        $response = Invoke-WebRequest @params
        return @{
            Success = $true
            Data = $response.Content | ConvertFrom-Json
            StatusCode = $response.StatusCode
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode
        }
    }
}

# Test 1: Login endpoints
Write-Host "TEST 1 - AUTH LOGIN"
Write-Host "-------------------------------------"

$loginBody = @{email = "admin@techcorp.com"; password = "password123"; tenantSubdomain = "techcorp"}
$loginResult = Invoke-ApiRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody
if ($loginResult.Success) {
    Write-Host "[OK] TechCorp Admin Login SUCCESS"
    Write-Host "     Role: $($loginResult.Data.data.user.role)"
    $techcorpToken = $loginResult.Data.data.token
} else {
    Write-Host "[FAIL] TechCorp Admin Login: $($loginResult.Error)"
    exit 1
}

$superLoginBody = @{email = "superadmin@system.com"; password = "Admin@123"; tenantSubdomain = "system"}
$superLoginResult = Invoke-ApiRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $superLoginBody
if ($superLoginResult.Success) {
    Write-Host "[OK] Super Admin Login SUCCESS"
    Write-Host "     Role: $($superLoginResult.Data.data.user.role)"
    $superAdminToken = $superLoginResult.Data.data.token
} else {
    Write-Host "[FAIL] Super Admin Login: $($superLoginResult.Error)"
    exit 1
}

# Test 2: Projects endpoints
Write-Host ""
Write-Host "TEST 2 - PROJECTS"
Write-Host "-------------------------------------"

$projectsResult = Invoke-ApiRequest -Uri "http://localhost:5000/api/projects" -Method GET -Token $techcorpToken
if ($projectsResult.Success) {
    Write-Host "[OK] GET /api/projects SUCCESS"
    Write-Host "     Count: $($projectsResult.Data.data.Count)"
    foreach ($proj in $projectsResult.Data.data) {
        Write-Host "     - $($proj.name)"
    }
} else {
    Write-Host "[FAIL] GET /api/projects: $($projectsResult.Error)"
}

# Test 3: Tasks endpoints
Write-Host ""
Write-Host "TEST 3 - TASKS"
Write-Host "-------------------------------------"

if ($projectsResult.Success -and $projectsResult.Data.data.Count -gt 0) {
    $projectId = $projectsResult.Data.data[0].id
    $tasksResult = Invoke-ApiRequest -Uri "http://localhost:5000/api/tasks?projectId=$projectId" -Method GET -Token $techcorpToken
    if ($tasksResult.Success) {
        Write-Host "[OK] GET /api/tasks SUCCESS"
        Write-Host "     Count: $($tasksResult.Data.data.Count)"
        foreach ($task in $tasksResult.Data.data | Select-Object -First 2) {
            Write-Host "     - $($task.title)"
        }
    } else {
        Write-Host "[FAIL] GET /api/tasks: $($tasksResult.Error)"
    }
}

# Test 4: Users endpoints
Write-Host ""
Write-Host "TEST 4 - USERS"
Write-Host "-------------------------------------"

$usersResult = Invoke-ApiRequest -Uri "http://localhost:5000/api/users" -Method GET -Token $techcorpToken
if ($usersResult.Success) {
    Write-Host "[OK] GET /api/users SUCCESS"
    Write-Host "     Count: $($usersResult.Data.data.Count)"
    foreach ($user in $usersResult.Data.data | Select-Object -First 2) {
        Write-Host "     - $($user.email) ($($user.role))"
    }
} else {
    Write-Host "[FAIL] GET /api/users: $($usersResult.Error)"
}

# Test 5: Tenants endpoints
Write-Host ""
Write-Host "TEST 5 - TENANTS (SUPER ADMIN)"
Write-Host "-------------------------------------"

$tenantsResult = Invoke-ApiRequest -Uri "http://localhost:5000/api/tenants" -Method GET -Token $superAdminToken
if ($tenantsResult.Success) {
    Write-Host "[OK] GET /api/tenants SUCCESS"
    Write-Host "     Count: $($tenantsResult.Data.data.Count)"
    foreach ($tenant in $tenantsResult.Data.data) {
        Write-Host "     - $($tenant.name) ($($tenant.subdomain))"
    }
} else {
    Write-Host "[FAIL] GET /api/tenants: $($tenantsResult.Error)"
}

# Test 6: Health endpoint
Write-Host ""
Write-Host "TEST 6 - HEALTH"
Write-Host "-------------------------------------"

$healthResult = Invoke-ApiRequest -Uri "http://localhost:5000/api/health" -Method GET
if ($healthResult.Success) {
    Write-Host "[OK] GET /api/health SUCCESS"
} else {
    Write-Host "[FAIL] GET /api/health: $($healthResult.Error)"
}

# Test 7: Create new project
Write-Host ""
Write-Host "TEST 7 - CREATE PROJECT"
Write-Host "-------------------------------------"

$newProjectBody = @{
    name = "New Test Project"
    description = "Created via API"
}
$createProjectResult = Invoke-ApiRequest -Uri "http://localhost:5000/api/projects" -Method POST -Body $newProjectBody -Token $techcorpToken
if ($createProjectResult.Success) {
    Write-Host "[OK] POST /api/projects SUCCESS"
    Write-Host "     Project: $($createProjectResult.Data.data.name)"
    $newProjectId = $createProjectResult.Data.data.id
} else {
    Write-Host "[FAIL] POST /api/projects: $($createProjectResult.Error)"
}

# Test 8: Create new task
Write-Host ""
Write-Host "TEST 8 - CREATE TASK"
Write-Host "-------------------------------------"

if ($createProjectResult.Success) {
    $newTaskBody = @{
        projectId = $newProjectId
        title = "Test Task"
        description = "Created via API"
        status = "todo"
        priority = "high"
    }
    $createTaskResult = Invoke-ApiRequest -Uri "http://localhost:5000/api/tasks" -Method POST -Body $newTaskBody -Token $techcorpToken
    if ($createTaskResult.Success) {
        Write-Host "[OK] POST /api/tasks SUCCESS"
        Write-Host "     Task: $($createTaskResult.Data.data.title)"
    } else {
        Write-Host "[FAIL] POST /api/tasks: $($createTaskResult.Error)"
    }
}

# Summary
Write-Host ""
Write-Host "TESTING COMPLETED"
Write-Host "====================================="
