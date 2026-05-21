# Verification Script - Check NoMediator Setup
# Run: powershell -ExecutionPolicy Bypass -File verify-setup.ps1

$checks = @()
$errors = 0

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NoMediator Setup Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check 1: PostgreSQL
Write-Host "`n[1/6] Checking PostgreSQL installation..." -ForegroundColor Yellow
$psql = Get-Command psql -ErrorAction SilentlyContinue
if ($psql) {
    $version = & psql --version 2>$null
    Write-Host "   [OK] $version" -ForegroundColor Green
    $checks += @{name="PostgreSQL"; status="OK"}
} else {
    Write-Host "   [ERROR] PostgreSQL not found" -ForegroundColor Red
    Write-Host "   Solution: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    $errors++
}

# Check 2: Node.js
Write-Host "`n[2/6] Checking Node.js installation..." -ForegroundColor Yellow
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    $version = & node --version 2>$null
    Write-Host "   [OK] Node.js $version" -ForegroundColor Green
    $checks += @{name="Node.js"; status="OK"}
} else {
    Write-Host "   [ERROR] Node.js not found" -ForegroundColor Red
    Write-Host "   Solution: https://nodejs.org/" -ForegroundColor Yellow
    $errors++
}

# Check 3: Backend .env
Write-Host "`n[3/6] Checking backend configuration..." -ForegroundColor Yellow
$envPath = "backend\.env"
if (Test-Path $envPath) {
    Write-Host "   [OK] backend\.env exists" -ForegroundColor Green
    $checks += @{name=".env file"; status="OK"}
} else {
    Write-Host "   [ERROR] backend\.env not found" -ForegroundColor Red
    Write-Host "   Solution: Run setup-backend.ps1 or setup-backend.bat" -ForegroundColor Yellow
    $errors++
}

# Check 4: Node modules
Write-Host "`n[4/6] Checking backend dependencies..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    Write-Host "   [OK] node_modules exists" -ForegroundColor Green
    $checks += @{name="Dependencies"; status="OK"}
} else {
    Write-Host "   [ERROR] backend\node_modules not found" -ForegroundColor Red
    Write-Host "   Solution: cd backend; npm install" -ForegroundColor Yellow
    $errors++
}

# Check 5: Database connection
Write-Host "`n[5/6] Checking PostgreSQL database..." -ForegroundColor Yellow
if (Test-Path $envPath) {
    $env_content = Get-Content $envPath
    $dburl = $env_content | Select-String "DATABASE_URL"
    
    Write-Host "   Testing connection..." -ForegroundColor Gray
    $env:PGPASSWORD = "nomediator_password_123"
    $testConnection = & psql -U nomediator_user -d nomediator -h localhost -c "SELECT 1" 2>$null
    $env:PGPASSWORD = $null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Connected to database" -ForegroundColor Green
        $checks += @{name="Database Connection"; status="OK"}
    } else {
        Write-Host "   [WARN] Cannot connect to database" -ForegroundColor Yellow
        Write-Host "   Solution: Run setup-backend.ps1 or net start postgresql-x64-16" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [SKIP] .env not found" -ForegroundColor Gray
}

# Check 6: Database schema
Write-Host "`n[6/6] Checking database schema..." -ForegroundColor Yellow
if (Test-Path $envPath) {
    $env:PGPASSWORD = "nomediator_password_123"
    $tableCheck = & psql -U nomediator_user -d nomediator -h localhost -c "\dt" 2>$null
    $env:PGPASSWORD = $null
    
    if ($LASTEXITCODE -eq 0 -and $tableCheck -match "users") {
        Write-Host "   [OK] Users table exists" -ForegroundColor Green
        
        # Count users
        $env:PGPASSWORD = "nomediator_password_123"
        $userCount = & psql -U nomediator_user -d nomediator -h localhost -c "SELECT COUNT(*) as user_count FROM users;" 2>&1 | Select-String "user_count" -A 1 | Select-String -Pattern "[0-9]+"
        $env:PGPASSWORD = $null
        
        if ($userCount) {
            Write-Host "   [OK] Database accessible and working" -ForegroundColor Green
            $checks += @{name="Database Schema"; status="OK"}
        }
    } else {
        Write-Host "   [WARN] Cannot access database tables" -ForegroundColor Yellow
        Write-Host "   Solution: psql -U nomediator_user -d nomediator -f backend\migrations\init.sql" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [SKIP] .env not found" -ForegroundColor Gray
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
if ($errors -gt 0) {
    Write-Host "Verification INCOMPLETE" -ForegroundColor Red
    Write-Host "Please fix the $errors error(s) above and run again" -ForegroundColor Yellow
} else {
    Write-Host "Verification COMPLETE SUCCESS" -ForegroundColor Green
    Write-Host "Backend is ready!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "  1. Start backend: cd backend; npm start" -ForegroundColor Cyan
    Write-Host "  2. Start frontend: npm start" -ForegroundColor Cyan
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nVerification run completed."

