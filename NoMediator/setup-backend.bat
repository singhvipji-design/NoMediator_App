@echo off
REM Backend + Database Setup Script for Windows
REM This script automates PostgreSQL, database, and backend setup

echo ========================================
echo NoMediator Backend Setup
echo ========================================

echo.
echo [1/5] Checking PostgreSQL installation...
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL not found. Please install PostgreSQL first.
    echo Download from: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('psql --version') do set psql_version=%%i
echo OK - Found: %psql_version%

echo.
echo [2/5] Creating PostgreSQL database and user...
REM Get postgres password from user
set /p postgres_pass=Enter PostgreSQL 'postgres' user password: 
if "%postgres_pass%"=="" (
    echo ERROR: Password required
    pause
    exit /b 1
)

REM Create database and user
psql -U postgres -h localhost -c "CREATE DATABASE IF NOT EXISTS nomediator;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database. Check postgres password.
    pause
    exit /b 1
)

psql -U postgres -h localhost -c "CREATE USER IF NOT EXISTS nomediator_user WITH PASSWORD 'nomediator_password_123';" >nul 2>&1
psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE nomediator TO nomediator_user;" >nul 2>&1
echo OK - Database and user created

echo.
echo [3/5] Initializing database schema...
psql -U nomediator_user -d nomediator -h localhost -f migrations\init.sql >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Failed to initialize schema
    pause
    exit /b 1
)
echo OK - Schema initialized (users table created)

echo.
echo [4/5] Creating .env file...
if exist backend\.env (
    echo WARNING: .env already exists, skipping...
) else (
    echo Creating backend\.env...
    (
        echo DATABASE_URL=postgresql://nomediator_user:nomediator_password_123@localhost:5432/nomediator
        echo JWT_SECRET=nomediator_super_secret_key_change_in_production
        echo PORT=4000
        echo NODE_ENV=development
    ) > backend\.env
    echo OK - .env created
)

echo.
echo [5/5] Installing backend dependencies...
cd backend
call npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo OK - Dependencies installed

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the backend, run:
echo   cd backend
echo   npm start
echo.
echo To start the frontend, run:
echo   npm start
echo   or
echo   npx expo start --web
echo.
pause
