# Complete Endpoint Validation - All 21 Endpoints
$baseUrl = "http://localhost:5000/api"
$pass = 0
$fail = 0

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  COMPLETE API ENDPOINT VALIDATION" -ForegroundColor Cyan  
Write-Host "================================================`n" -ForegroundColor Cyan

# 1. Health
Write-Host "[1/21] Health Check..." -ForegroundColor Yellow
try {
    $h = Invoke-RestMethod "$baseUrl/health"
    if ($h.success) { Write-Host "PASS" -ForegroundColor Green; $pass++ } else { throw "Failed" }
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

# 2-4. Auth
Write-Host "[2/21] Login (TechCorp)..." -ForegroundColor Yellow
try {
    $login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{email='admin@techcorp.com';password='password123';tenantSubdomain='techcorp'}|ConvertTo-Json) -ContentType 'application/json'
    $global:token = $login.data.token
    $global:headers = @{'Authorization'="Bearer $token";'Content-Type'='application/json'}
    Write-Host "PASS - Token: $($token.Substring(0,20))..." -ForegroundColor Green; $pass++
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++; exit 1 }

Write-Host "[3/21] Login (Invalid Password)..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{email='admin@techcorp.com';password='wrong';tenantSubdomain='techcorp'}|ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
    Write-Host "FAIL - Should have rejected" -ForegroundColor Red; $fail++
} catch { 
    if ($_.Exception.Response.StatusCode -eq 401) { Write-Host "PASS - Correctly rejected (401)" -ForegroundColor Green; $pass++ } 
    else { Write-Host "FAIL: Wrong error code" -ForegroundColor Red; $fail++ }
}

Write-Host "[4/21] Register New Tenant..." -ForegroundColor Yellow
try {
    $reg = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body (@{tenantName="TestCorp$(Get-Random)";subdomain="test$(Get-Random)";adminEmail="admin$(Get-Random)@test.com";adminPassword="Test@123";adminFullName="Test Admin"}|ConvertTo-Json) -ContentType 'application/json'
    if ($reg.success) { Write-Host "PASS" -ForegroundColor Green; $pass++ } else { throw "Failed" }
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

# 5-8. Users  
Write-Host "[5/21] GET /users..." -ForegroundColor Yellow
try {
    $users = Invoke-RestMethod "$baseUrl/users" -Headers $headers
    Write-Host "PASS - Found $($users.data.Count) users" -ForegroundColor Green; $pass++
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

Write-Host "[6/21] POST /users (Create)..." -ForegroundColor Yellow
try {
    $newUser = Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -Headers $headers -Body (@{email="test$(Get-Random)@techcorp.com";password="Test@123";fullName="Test User";role="user"}|ConvertTo-Json)
    $global:userId = $newUser.data.id
    Write-Host "PASS - Created ID: $userId" -ForegroundColor Green; $pass++
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

Write-Host "[7/21] GET /users/:id..." -ForegroundColor Yellow
try {
    $user = Invoke-RestMethod "$baseUrl/users/$userId" -Headers $headers
    Write-Host "PASS - $($user.data.full_name)" -ForegroundColor Green; $pass++
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

Write-Host "[8/21] PUT /users/:id..." -ForegroundColor Yellow
try {
    $updated = Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method Put -Headers $headers -Body (@{fullName="Updated User"}|ConvertTo-Json)
    Write-Host "PASS - $($updated.data.full_name)" -ForegroundColor Green; $pass++
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

# 9-12. Projects
Write-Host "[9/21] GET /projects..." -ForegroundColor Yellow
try {
    $projects = Invoke-RestMethod "$baseUrl/projects" -Headers $headers
    Write-Host "PASS - Found $($projects.data.Count) projects" -ForegroundColor Green; $pass++
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

Write-Host "[10/21] POST /projects (Create)..." -ForegroundColor Yellow
try {
    $newProj = Invoke-RestMethod -Uri "$baseUrl/projects" -Method Post -Headers $headers -Body (@{name="Test Project $(Get-Random)";description="Test";status="active"}|ConvertTo-Json)
    $global:projectId = $newProj.data.id
    Write-Host "PASS - Created ID: $projectId" -ForegroundColor Green; $pass++
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

Write-Host "[11/21] GET /projects/:id..." -ForegroundColor Yellow
try {
    $proj = Invoke-RestMethod "$baseUrl/projects/$projectId" -Headers $headers
    Write-Host "PASS - $($proj.data.name)" -ForegroundColor Green; $pass++
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

Write-Host "[12/21] PUT /projects/:id..." -ForegroundColor Yellow
try {
    $updated = Invoke-RestMethod -Uri "$baseUrl/projects/$projectId" -Method Put -Headers $headers -Body (@{status="completed"}|ConvertTo-Json)
    Write-Host "PASS - Status: $($updated.data.status)" -ForegroundColor Green; $pass++
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

# 13-17. Tasks
Write-Host "[13/21] GET /tasks..." -ForegroundColor Yellow
try {
    $tasks = Invoke-RestMethod "$baseUrl/tasks" -Headers $headers
    Write-Host "PASS - Found $($tasks.data.Count) tasks" -ForegroundColor Green; $pass++
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

Write-Host "[14/21] POST /tasks (Create)..." -ForegroundColor Yellow
try {
    $newTask = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Post -Headers $headers -Body (@{projectId=$projectId;title="Test Task $(Get-Random)";description="Test";status="pending";priority="high"}|ConvertTo-Json)
    $global:taskId = $newTask.data.id
    Write-Host "PASS - Created ID: $taskId" -ForegroundColor Green; $pass++
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

Write-Host "[15/21] GET /tasks/:id..." -ForegroundColor Yellow
try {
    $task = Invoke-RestMethod "$baseUrl/tasks/$taskId" -Headers $headers
    Write-Host "PASS - $($task.data.title)" -ForegroundColor Green; $pass++
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

Write-Host "[16/21] PUT /tasks/:id..." -ForegroundColor Yellow
try {
    $updated = Invoke-RestMethod -Uri "$baseUrl/tasks/$taskId" -Method Put -Headers $headers -Body (@{status="in_progress"}|ConvertTo-Json)
    Write-Host "PASS - Status: $($updated.data.status)" -ForegroundColor Green; $pass++
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

Write-Host "[17/21] DELETE /tasks/:id..." -ForegroundColor Yellow
try {
    $deleted = Invoke-RestMethod -Uri "$baseUrl/tasks/$taskId" -Method Delete -Headers $headers
    Write-Host "PASS - Deleted" -ForegroundColor Green; $pass++
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

# 18-19. Tenants (403 expected)
Write-Host "[18/21] GET /tenants (Should be 403)..." -ForegroundColor Yellow
try {
    Invoke-RestMethod "$baseUrl/tenants" -Headers $headers -ErrorAction Stop
    Write-Host "FAIL - Should be forbidden" -ForegroundColor Red; $fail++
} catch { 
    if ($_.Exception.Response.StatusCode -eq 403) { Write-Host "PASS - Correctly forbidden (403)" -ForegroundColor Green; $pass++ }
    else { Write-Host "FAIL: Wrong error" -ForegroundColor Red; $fail++ }
}

Write-Host "[19/21] DELETE /projects/:id..." -ForegroundColor Yellow
try {
    $deleted = Invoke-RestMethod -Uri "$baseUrl/projects/$projectId" -Method Delete -Headers $headers
    Write-Host "PASS - Deleted" -ForegroundColor Green; $pass++
} catch { Write-Host "FAIL: $_" -ForegroundColor Red; $fail++ }

# 20-21. Error Cases
Write-Host "[20/21] GET /users (No Token - 401)..." -ForegroundColor Yellow
try {
    Invoke-RestMethod "$baseUrl/users" -ErrorAction Stop
    Write-Host "FAIL - Should be unauthorized" -ForegroundColor Red; $fail++
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) { Write-Host "PASS - Correctly unauthorized (401)" -ForegroundColor Green; $pass++ }
    else { Write-Host "FAIL: Wrong error" -ForegroundColor Red; $fail++ }
}

Write-Host "[21/21] GET /users/99999 (Not Found - 404)..." -ForegroundColor Yellow
try {
    Invoke-RestMethod "$baseUrl/users/99999" -Headers $headers -ErrorAction Stop
    Write-Host "FAIL - Should be 404" -ForegroundColor Red; $fail++
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) { Write-Host "PASS - Correctly 404" -ForegroundColor Green; $pass++ }
    else { Write-Host "FAIL: Wrong error" -ForegroundColor Red; $fail++ }
}

# Summary
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  RESULTS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Passed: $pass/21" -ForegroundColor Green
Write-Host "Failed: $fail/21" -ForegroundColor $(if($fail -eq 0){"Green"}else{"Red"})

if ($fail -eq 0) {
    Write-Host "`nALL ENDPOINTS READY FOR PRODUCTION!" -ForegroundColor Green
    Write-Host "Database: Neon PostgreSQL (Cloud)" -ForegroundColor Cyan
    Write-Host "Multi-Tenancy: WORKING" -ForegroundColor Cyan
    Write-Host "Authentication: WORKING" -ForegroundColor Cyan
    Write-Host "Authorization: WORKING" -ForegroundColor Cyan
} else {
    Write-Host "`nSome endpoints need attention" -ForegroundColor Yellow
}
Write-Host "================================================`n" -ForegroundColor Cyan
