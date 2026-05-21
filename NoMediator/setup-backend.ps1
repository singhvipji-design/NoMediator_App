# Backend + Database Setup Script for Windows PowerShell
# Run: powershell -ExecutionPolicy Bypass -File setup-backend.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NoMediator Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Check PostgreSQL
Write-Host "`n[1/5] Checking PostgreSQL installation..." -ForegroundColor Yellow
$psqlVersion = psql --version 2>$null
if (-not $psqlVersion) {
    Write-Host "ERROR: PostgreSQL not found!" -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "OK - Found: $psqlVersion" -ForegroundColor Green

# Step 2: Get postgres password
Write-Host "`n[2/5] Setting up database and user..." -ForegroundColor Yellow
$postgresPass = Read-Host "Enter PostgreSQL 'postgres' user password" -AsSecureString
$postgresPassPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($postgresPass))

# Test connection
$env:PGPASSWORD = $postgresPassPlain
$testConnection = psql -U postgres -h localhost -c "SELECT 1" 2>$null
if (-not $testConnection) {
    Write-Host "ERROR: Cannot connect to PostgreSQL. Check password." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Create database
Write-Host "Creating database..." -ForegroundColor Gray
psql -U postgres -h localhost -c "CREATE DATABASE IF NOT EXISTS nomediator;" 2>$null

# Create user
Write-Host "Creating user..." -ForegroundColor Gray
psql -U postgres -h localhost -c "CREATE USER IF NOT EXISTS nomediator_user WITH PASSWORD 'nomediator_password_123';" 2>$null

# Grant privileges
psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE nomediator TO nomediator_user;" 2>$null
psql -U postgres -h localhost -d nomediator -c "GRANT ALL PRIVILEGES ON SCHEMA public TO nomediator_user;" 2>$null

$env:PGPASSWORD = $null
Write-Host "OK - Database and user created" -ForegroundColor Green

# Step 3: Initialize schema
Write-Host "`n[3/5] Initializing database schema..." -ForegroundColor Yellow
$env:PGPASSWORD = "nomediator_password_123"
$schemaOutput = psql -U nomediator_user -d nomediator -h localhost -f migrations\init.sql 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to initialize schema" -ForegroundColor Red
    Write-Host $schemaOutput -ForegroundColor Red
    $env:PGPASSWORD = $null
    Read-Host "Press Enter to exit"
    exit 1
}
$env:PGPASSWORD = $null
Write-Host "OK - Schema initialized (users table created)" -ForegroundColor Green

# Step 4: Create .env
Write-Host "`n[4/5] Creating .env file..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "WARNING: backend\.env already exists, skipping..." -ForegroundColor Yellow
} else {
    @"
DATABASE_URL=postgresql://nomediator_user:nomediator_password_123@localhost:5432/nomediator
JWT_SECRET=nomediator_super_secret_key_change_in_production
PORT=4000
NODE_ENV=development
"@ | Out-File -FilePath "backend\.env" -Encoding UTF8 -NoNewline
    Write-Host "OK - .env created" -ForegroundColor Green
}

# Step 5: Install dependencies
Write-Host "`n[5/5] Installing backend dependencies..." -ForegroundColor Yellow
Push-Location backend
npm install | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    Pop-Location
    Read-Host "Press Enter to exit"
    exit 1
}
Pop-Location
Write-Host "OK - Dependencies installed" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nTo start the backend, run:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor Cyan
Write-Host "  npm start" -ForegroundColor Cyan

Write-Host "`nTo start the frontend, run:" -ForegroundColor Yellow
Write-Host "  npm start" -ForegroundColor Cyan
Write-Host "  or" -ForegroundColor Gray
Write-Host "  npx expo start --web" -ForegroundColor Cyan

Write-Host "`nNext, verify backend is working:" -ForegroundColor Yellow
Write-Host "  curl http://localhost:4000/api/health" -ForegroundColor Cyan

Read-Host "`nPress Enter to close"
