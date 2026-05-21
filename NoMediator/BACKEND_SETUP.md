# Backend + Database Setup Guide

## Prerequisites

### 1. PostgreSQL Installation (Windows)

**Option A: Using Windows Installer (Easiest)**
- Download: https://www.postgresql.org/download/windows/
- Run installer
- Choose installation directory (e.g., `C:\Program Files\PostgreSQL\16`)
- Set password for `postgres` superuser (remember this!)
- Accept default port: `5432`
- Skip Stack Builder at the end

**Option B: Using Chocolatey**
```powershell
choco install postgresql
```

**Option C: Using Docker (Advanced)**
```powershell
docker run -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nomediator -p 5432:5432 postgres:16
```

### 2. Verify PostgreSQL Installation
```powershell
psql --version
```
Should show: `psql (PostgreSQL) 16.x`

---

## Step 1: Create Database & User

Open PowerShell and connect to PostgreSQL:

```powershell
psql -U postgres
```

Then run these commands:

```sql
-- Create database
CREATE DATABASE nomediator;

-- Create user with strong password
CREATE USER nomediator_user WITH PASSWORD 'nomediator_password_123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE nomediator TO nomediator_user;

-- Connect to the database
\c nomediator

-- Grant schema privileges
GRANT ALL PRIVILEGES ON SCHEMA public TO nomediator_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nomediator_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO nomediator_user;

-- Exit
\q
```

**Alternative: Single command script**
```powershell
psql -U postgres -c "CREATE DATABASE nomediator;" -c "CREATE USER nomediator_user WITH PASSWORD 'nomediator_password_123';" -c "GRANT ALL PRIVILEGES ON DATABASE nomediator TO nomediator_user;" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nomediator_user;"
```

---

## Step 2: Backend Environment Setup

Navigate to backend directory:
```powershell
cd backend
```

Create `.env` file from template:
```powershell
Copy-Item .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL=postgresql://nomediator_user:nomediator_password_123@localhost:5432/nomediator
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=4000
NODE_ENV=development
```

---

## Step 3: Install Backend Dependencies

```powershell
cd backend
npm install
```

Expected output: All packages installed successfully

---

## Step 4: Initialize Database Schema

Run migration to create `users` table:

```powershell
psql -U nomediator_user -d nomediator -f migrations/init.sql
```

Verify table was created:
```powershell
psql -U nomediator_user -d nomediator -c "\dt"
```

Should output:
```
         List of relations
 Schema |       Name       | Type  | Owner
--------+------------------+-------+------------------
 public | users            | table | nomediator_user
```

---

## Step 5: Start Backend Server

```powershell
cd backend
npm start
```

Expected output:
```
Backend running on http://localhost:4000
Connected to PostgreSQL successfully
```

---

## Step 6: Test Backend Health

Open new PowerShell window:

```powershell
curl http://localhost:4000/api/health
```

Should return:
```json
{"status":"ok"}
```

---

## Step 7: Test Auth Endpoints

### Register New User

```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    phone = "+91 9876543210"
    password = "SecurePassword123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

Expected response:
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "role": "Tenant",
    "created_at": "2026-05-21T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login User

```powershell
$body = @{
    email = "john@example.com"
    password = "SecurePassword123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

---

## Step 8: Test Frontend Connection

Make sure backend is running. Then start the frontend:

```powershell
# From project root (NoMediator folder)
cd ..
npm install
npm start
```

Or for web:
```powershell
npx expo start --web
```

Press `w` for web. The app should load.

### Test Login Flow

1. Go to **Register** tab
2. Fill in form:
   - Name: `Jane Doe`
   - Email: `jane@example.com`
   - Phone: `+91 9876543210`
   - Password: `Password123`
3. Click **Create Account**

Should see success and navigate to Home screen.

---

## Troubleshooting

### Issue: `DATABASE_URL must be set`
**Solution:** Ensure `.env` file exists in `backend/` folder with correct path

### Issue: `Connect ECONNREFUSED 127.0.0.1:5432`
**Solutions:**
- Verify PostgreSQL is running: `pg_ctl status -D "C:\Program Files\PostgreSQL\16\data"`
- Start PostgreSQL service (Windows): `net start postgresql-x64-16`
- Or use Services app: Press `Win + R`, type `services.msc`, find PostgreSQL, right-click → Start

### Issue: `password authentication failed`
**Solution:** Verify database credentials in `.env` match what you set in Step 1

### Issue: `relation "users" does not exist`
**Solution:** Run migration again: `psql -U nomediator_user -d nomediator -f migrations/init.sql`

### Issue: CORS error in frontend
**Solution:** Backend already has CORS enabled. Restart backend server.

### Issue: Backend runs but frontend shows "Network Error"
**Solution:** 
- Check backend is running on port 4000
- Check frontend `AuthContext.js` API_URL matches: `http://localhost:4000` (for web)
- For Android emulator, it should be `http://10.0.2.2:4000`

---

## Development Workflow

### Start Backend (with auto-reload)
```powershell
cd backend
npm run dev
```

### Start Frontend
```powershell
# New PowerShell window, from project root
npm start
# or
npx expo start --web
```

### Monitor Backend Logs
Backend logs will show in the terminal running `npm run dev` or `npm start`

### Database Inspection
```powershell
# Connect to database
psql -U nomediator_user -d nomediator

# List tables
\dt

# View all users
SELECT * FROM users;

# View user by email
SELECT * FROM users WHERE email = 'john@example.com';

# Exit
\q
```

---

## Security Notes (For Production)

⚠️ **Change these before deploying:**

1. `JWT_SECRET` in `.env` - Use a strong random string
   ```powershell
   [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Minimum 1000000000 -Maximum 9999999999).ToString())) | ForEach-Object { $_ + (Get-Random).ToString() }
   ```

2. Database password - Use strong password
3. Database URL - Don't commit `.env` to git
4. Add `.env` to `.gitignore`

---

## API Reference

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "string (required)",
  "email": "string (required, unique)",
  "phone": "string (optional)",
  "password": "string (required)"
}

Response 201:
{
  "user": { id, name, email, phone, role, created_at },
  "token": "JWT token"
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "string (required)",
  "password": "string (required)"
}

Response 200:
{
  "user": { id, name, email, phone, role, created_at },
  "token": "JWT token"
}
```

### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}

Response 200:
{
  "user": { id, name, email, phone, role, created_at }
}
```

---

## Next Steps

After setup is complete:

1. ✅ Backend running and connected to database
2. ✅ Auth endpoints working
3. ✅ Frontend able to register/login
4. 🔜 Add property listing endpoints
5. 🔜 Add search/filter functionality
6. 🔜 Add posting feature
7. 🔜 Add saved properties

