# File Reference Guide

## 📖 Documentation Files (Read in This Order)

### 1. README_SETUP.md ⭐ START HERE
- **Purpose:** Overview of everything that was set up
- **Read Time:** 5 minutes
- **Content:** Summary, quick start, feature overview
- **Action:** Start here to understand the big picture

### 2. QUICK_START.md
- **Purpose:** Quick reference guide
- **Read Time:** 3 minutes
- **Content:** Commands to run, basic testing
- **Action:** Use this every time you start development

### 3. BACKEND_SETUP.md
- **Purpose:** Detailed step-by-step setup guide
- **Read Time:** 15 minutes
- **Content:** PostgreSQL installation, database creation, troubleshooting
- **Action:** Refer to when something doesn't work

### 4. API_DOCUMENTATION.md
- **Purpose:** Complete API reference
- **Read Time:** 20 minutes
- **Content:** All endpoints, examples, error codes
- **Action:** Use when building API calls

### 5. ROADMAP.md
- **Purpose:** Implementation roadmap
- **Read Time:** 15 minutes
- **Content:** Phases 2-8, future features, database schema
- **Action:** Plan next features from here

---

## 🛠 Setup & Verification Scripts

### setup-backend.ps1
- **Type:** PowerShell script
- **Purpose:** Automated one-command setup
- **What It Does:**
  - Checks PostgreSQL installation
  - Creates database and user
  - Initializes database schema
  - Creates .env file
  - Installs npm dependencies
- **When To Use:** First time setup or clean reinstall
- **How To Run:**
  ```powershell
  .\setup-backend.ps1
  ```

### setup-backend.bat
- **Type:** Windows Batch script
- **Purpose:** Automated one-command setup (alternative to PowerShell)
- **What It Does:** Same as PowerShell version
- **When To Use:** If PowerShell doesn't work
- **How To Run:**
  ```cmd
  setup-backend.bat
  ```

### verify-setup.ps1
- **Type:** PowerShell script
- **Purpose:** Verify installation is correct
- **What It Checks:**
  - PostgreSQL installed
  - Node.js installed
  - .env file exists
  - Dependencies installed
  - Database connection works
  - Database tables created
- **When To Use:** After setup or when troubleshooting
- **How To Run:**
  ```powershell
  .\verify-setup.ps1
  ```

### verify-setup.bat
- **Type:** Windows Batch script
- **Purpose:** Verify installation (alternative to PowerShell)
- **What It Checks:** Same as PowerShell version
- **When To Use:** If PowerShell verification doesn't work
- **How To Run:**
  ```cmd
  verify-setup.bat
  ```

---

## 📝 Updated Application Files

### context/AuthContext.js
- **Location:** `NoMediator/context/AuthContext.js`
- **What Changed:**
  - Added AsyncStorage import
  - Added token state management
  - Added token persistence (save after login)
  - Added token restoration on app start
  - Added token validation via `/api/auth/me`
  - Added logout that clears storage
- **Impact:** Users now stay logged in after app restart
- **Related:** Uses `@react-native-async-storage/async-storage`

### package.json
- **Location:** `NoMediator/package.json`
- **What Changed:**
  - Added `@react-native-async-storage/async-storage` dependency
- **Why:** Needed for storing JWT tokens persistently
- **Update:** Already installed, no action needed

---

## 🗄️ Backend Files (Already Existed, Now Working)

### backend/server.js
- **Purpose:** Express server entry point
- **What It Does:**
  - Loads environment variables
  - Creates Express app
  - Sets up CORS
  - Mounts auth routes
  - Connects to PostgreSQL
  - Starts listening on port 4000
- **Status:** Ready to use

### backend/routes/auth.js
- **Purpose:** Authentication endpoints
- **Endpoints:**
  - `POST /api/auth/register` - Create account
  - `POST /api/auth/login` - Login
  - `GET /api/auth/me` - Get current user
- **Security:** Uses bcrypt for passwords, JWT for tokens
- **Status:** Ready to use

### backend/db.js
- **Purpose:** PostgreSQL connection pool
- **What It Does:**
  - Creates connection pool from DATABASE_URL
  - Provides query interface
- **Usage:** `const db = require('./db')`
- **Status:** Ready to use

### backend/migrations/init.sql
- **Purpose:** Database schema definition
- **What It Creates:** `users` table
- **Columns:**
  - id (primary key)
  - name (user's name)
  - email (unique)
  - phone (optional)
  - password (bcrypt hashed)
  - role (default 'Tenant')
  - created_at (timestamp)
- **Status:** Applied to database

### backend/package.json
- **Purpose:** Backend dependencies
- **Packages:**
  - express - Web server
  - pg - PostgreSQL driver
  - bcrypt - Password hashing
  - jsonwebtoken - JWT tokens
  - cors - CORS support
  - dotenv - Environment variables
- **Status:** All installed

### backend/.env
- **Purpose:** Configuration file
- **Created By:** setup script
- **Content:**
  ```
  DATABASE_URL=postgresql://nomediator_user:nomediator_password_123@localhost:5432/nomediator
  JWT_SECRET=nomediator_super_secret_key_change_in_production
  PORT=4000
  NODE_ENV=development
  ```
- **Status:** Created automatically

### backend/.env.example
- **Purpose:** Template for .env
- **What To Do:** setup script creates .env from this template
- **Status:** Reference file

### backend/README.md
- **Purpose:** Backend-specific documentation
- **Content:** Setup and API reference
- **Status:** Existing documentation

---

## 🎨 Frontend Files (No Changes, Working as Before)

### App.js
- **Purpose:** Root React component
- **Status:** Working, no changes
- **Uses:** AuthContext for auth state

### navigation/AppNavigator.js
- **Purpose:** Navigation routing
- **Routes:** Login → Home/Search/Post/Saved/Profile tabs
- **Status:** Working, now with persistent auth

### screens/LoginScreen.js
- **Purpose:** Login/Register UI
- **Status:** Working, uses updated AuthContext

### screens/HomeScreen.js, DetailScreen.js, etc.
- **Purpose:** App screens
- **Status:** Working as before
- **Next:** Will add property listings here

---

## 🗂️ Directory Structure

```
NoMediator/
├── 📖 Documentation (Read These)
│   ├── README_SETUP.md ⭐ START
│   ├── QUICK_START.md
│   ├── BACKEND_SETUP.md
│   ├── API_DOCUMENTATION.md
│   ├── ROADMAP.md
│   └── README.md (original)
│
├── 🛠 Setup Scripts
│   ├── setup-backend.ps1
│   ├── setup-backend.bat
│   ├── verify-setup.ps1
│   └── verify-setup.bat
│
├── 📦 Backend
│   └── backend/
│       ├── server.js ✅
│       ├── db.js ✅
│       ├── package.json ✅
│       ├── .env (created by setup)
│       ├── routes/auth.js ✅
│       └── migrations/init.sql ✅
│
├── 🎨 Frontend (React Native)
│   ├── App.js
│   ├── package.json (updated)
│   ├── app.json
│   ├── context/AuthContext.js (updated) ✅
│   ├── navigation/AppNavigator.js
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── DetailScreen.js
│   │   ├── SearchScreen.js
│   │   ├── PostScreen.js
│   │   ├── SavedScreen.js
│   │   └── ProfileScreen.js
│   ├── constants/
│   │   ├── theme.js
│   │   └── data.js
│   └── assets/
```

---

## 🎯 Quick Reference by Task

### "I want to start the app"
1. Read: `QUICK_START.md`
2. Run: `.\setup-backend.ps1` (first time only)
3. Start: Backend `cd backend && npm start`
4. Start: Frontend `npm start`

### "I got an error, what do I do?"
1. Read: `BACKEND_SETUP.md` → Troubleshooting section
2. Run: `.\verify-setup.ps1` to check installation
3. Check: Backend logs in Terminal 1
4. Check: Browser console in Terminal 2

### "How do I call the API?"
1. Read: `API_DOCUMENTATION.md`
2. Examples: cURL and JavaScript examples provided
3. Test: Use browser or Postman to test endpoints

### "What features can I build next?"
1. Read: `ROADMAP.md`
2. See: Phases 2-8 with database schemas
3. Pick: Property Listings (Phase 2) recommended next

### "I want to understand how it works"
1. Read: `README_SETUP.md` → How It Works section
2. Read: `BACKEND_SETUP.md` → Step 1-8 detailed
3. Read: `API_DOCUMENTATION.md` → Endpoint details

---

## ✅ File Checklist

All these files should exist:

**Documentation:**
- [ ] README_SETUP.md
- [ ] QUICK_START.md
- [ ] BACKEND_SETUP.md
- [ ] API_DOCUMENTATION.md
- [ ] ROADMAP.md

**Scripts:**
- [ ] setup-backend.ps1
- [ ] setup-backend.bat
- [ ] verify-setup.ps1
- [ ] verify-setup.bat

**Backend (in backend/ folder):**
- [ ] server.js
- [ ] db.js
- [ ] routes/auth.js
- [ ] migrations/init.sql
- [ ] package.json
- [ ] .env (created after setup)

**Frontend:**
- [ ] context/AuthContext.js (updated)
- [ ] package.json (updated)
- [ ] All screens and navigation

---

## 🚀 Next Steps

1. Read `README_SETUP.md` for overview
2. Read `QUICK_START.md` for commands
3. Run `.\setup-backend.ps1` to setup
4. Run `verify-setup.ps1` to confirm
5. Start backend and frontend
6. Test login/register in browser
7. Read `ROADMAP.md` for Phase 2

**Everything is ready. Let's build! 🚀**
