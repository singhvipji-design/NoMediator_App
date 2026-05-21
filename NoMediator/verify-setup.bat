@echo off
REM Verification script - Check if backend and database are set up correctly
REM Usage: verify-setup.bat

echo ========================================
echo NoMediator Setup Verification
echo ========================================
echo.

setlocal enabledelayedexpansion

REM Check 1: PostgreSQL
echo [1/6] Checking PostgreSQL installation...
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo   [ERROR] PostgreSQL not found
    echo   Solution: https://www.postgresql.org/download/windows/
    set error=1
) else (
    for /f "tokens=*" %%i in ('psql --version') do echo   [OK] %%i
)

REM Check 2: Node.js
echo.
echo [2/6] Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo   [ERROR] Node.js not found
    echo   Solution: https://nodejs.org/
    set error=1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo   [OK] Node.js %%i
)

REM Check 3: Backend .env
echo.
echo [3/6] Checking backend configuration...
if exist backend\.env (
    echo   [OK] backend\.env exists
) else (
    echo   [ERROR] backend\.env not found
    echo   Solution: Run setup-backend.ps1 or setup-backend.bat
    set error=1
)

REM Check 4: Node modules
echo.
echo [4/6] Checking backend dependencies...
if exist backend\node_modules (
    echo   [OK] node_modules exists
) else (
    echo   [ERROR] backend\node_modules not found
    echo   Solution: cd backend ^&^& npm install
    set error=1
)

REM Check 5: Database connection
echo.
echo [5/6] Checking PostgreSQL database...
if exist backend\.env (
    for /f "tokens=*" %%i in ('findstr "DATABASE_URL" backend\.env') do (
        setlocal enabledelayedexpansion
        set line=%%i
        set line=!line:DATABASE_URL=!
        echo   Testing connection...
    )
    REM Simple test - just check if psql can connect
    psql -U nomediator_user -d nomediator -h localhost -c "SELECT 1" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] Connected to database
    ) else (
        echo   [WARN] Cannot connect to database
        echo   Solution: Run setup-backend.ps1 or setup-backend.bat
        echo   OR verify PostgreSQL is running: net start postgresql-x64-16
    )
) else (
    echo   [SKIP] .env not found
)

REM Check 6: Database schema
echo.
echo [6/6] Checking database schema...
if exist backend\.env (
    psql -U nomediator_user -d nomediator -h localhost -c "\dt" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] Database tables exist
        psql -U nomediator_user -d nomediator -h localhost -c "SELECT COUNT(*) as user_count FROM users" 2>nul | findstr -R "[0-9]" >nul
        if !errorlevel! equ 0 (
            echo   [OK] Users table accessible
        )
    ) else (
        echo   [WARN] Cannot access database tables
        echo   Solution: Run: psql -U nomediator_user -d nomediator -f backend\migrations\init.sql
    )
) else (
    echo   [SKIP] .env not found
)

echo.
echo ========================================
if defined error (
    echo Verification INCOMPLETE
    echo Please fix errors above and run again
) else (
    echo Verification COMPLETE
    echo Backend is ready!
    echo.
    echo Next steps:
    echo   1. Start backend: cd backend ^&^& npm start
    echo   2. Start frontend: npm start
)
echo ========================================

pause
