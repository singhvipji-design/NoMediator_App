# Quick Start Guide - NoMediator Full Stack Setup

## First-Time Setup (5 minutes)

### Step 1: Run the automated setup script
This will create the database, initialize schema, and install dependencies.

**Option A: PowerShell (Recommended)**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\setup-backend.ps1
```

**Option B: Command Prompt**
```cmd
setup-backend.bat
```

**Option C: Manual Setup**
See [BACKEND_SETUP.md](BACKEND_SETUP.md) for step-by-step instructions.

---

## Starting the App (Every Time)

### Terminal 1: Start Backend (4000)
```powershell
cd backend
npm start
```

Wait for: `Connected to PostgreSQL successfully`

### Terminal 2: Start Frontend (Web)
```powershell
npm start
```

Press `w` for web browser

---

## Quick Test

### Test 1: Backend Health
```powershell
curl http://localhost:4000/api/health
# Expected: {"status":"ok"}
```

### Test 2: Register User
In browser at http://localhost:19006 or http://localhost:8081:
1. Switch to **Register** tab
2. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Phone: +91 9876543210
   - Password: Test123!
3. Click **Create Account**

### Test 3: Login
1. Switch to **Login** tab
2. Enter credentials from above
3. Click **Login**

If successful → You see **Home screen** 🎉

---

## Project Structure Quick Reference

```
NoMediator/
├── backend/                    # Express.js server
│   ├── server.js              # Main server file
│   ├── routes/auth.js         # Auth endpoints
│   ├── db.js                  # PostgreSQL pool
│   ├── migrations/init.sql    # Database schema
│   ├── package.json
│   └── .env                   # Database credentials (created by setup)
│
├── context/
│   └── AuthContext.js         # Auth state + token persistence
│
├── navigation/
│   └── AppNavigator.js        # Login/Home routing
│
├── screens/
│   ├── LoginScreen.js
│   ├── HomeScreen.js
│   ├── SearchScreen.js
│   ├── DetailScreen.js
│   ├── PostScreen.js
│   ├── SavedScreen.js
│   └── ProfileScreen.js
│
├── constants/
│   ├── theme.js               # Colors and sizes
│   └── data.js                # Mock data
│
├── App.js                     # Root component
├── package.json               # Frontend dependencies
├── app.json                   # Expo config
│
├── BACKEND_SETUP.md           # Detailed setup guide
├── setup-backend.ps1          # Automated setup (PowerShell)
├── setup-backend.bat          # Automated setup (Batch)
└── QUICK_START.md             # This file
```

---

## Key Changes Made

### 1. AuthContext.js - Token Persistence
- ✅ Saves JWT token to AsyncStorage after login
- ✅ Auto-restores session on app restart
- ✅ Validates token on app start via `/api/auth/me`
- ✅ Clears session on logout

### 2. package.json - Added Dependency
- ✅ Added `@react-native-async-storage/async-storage` for storing tokens

### 3. Backend Auth API
- ✅ `/api/auth/register` - Register new user
- ✅ `/api/auth/login` - Login existing user
- ✅ `/api/auth/me` - Get current user (requires JWT)

---

## Debugging Tips

### Backend won't start
```powershell
# Check if port 4000 is in use
netstat -ano | findstr :4000

# Kill process using port 4000
taskkill /PID <PID> /F

# Try again
npm start
```

### Cannot connect to database
```powershell
# Check PostgreSQL is running
net start postgresql-x64-16

# Verify credentials in backend\.env
type backend\.env
```

### Frontend shows "Network Error"
- Backend must be running on localhost:4000
- Check CORS is enabled in backend/server.js
- Restart both frontend and backend

### Stuck on login screen
- Check browser console for errors
- Verify backend health: `curl http://localhost:4000/api/health`
- Check `.env` file exists in backend folder

---

## Next Steps

After setup is working:

1. ✅ Backend + Database connected
2. ✅ Auth system working
3. 🔜 Property listing endpoints
4. 🔜 Search/Filter implementation
5. 🔜 Post property feature
6. 🔜 Save favorites feature

See [BACKEND_SETUP.md](BACKEND_SETUP.md) for complete API reference.

---

## PostgreSQL Commands (For Database Management)

```powershell
# Connect to database
psql -U nomediator_user -d nomediator

# View all users
SELECT * FROM users;

# Find specific user
SELECT * FROM users WHERE email = 'test@example.com';

# Clear all users (careful!)
DELETE FROM users;

# Exit
\q
```

---

## Environment Variables

**Frontend**: Uses API_URL from [context/AuthContext.js](context/AuthContext.js)
- Web: `http://localhost:4000`
- Android Emulator: `http://10.0.2.2:4000`
- iOS Simulator: `http://localhost:4000`

**Backend** (.env file):
```env
DATABASE_URL=postgresql://nomediator_user:nomediator_password_123@localhost:5432/nomediator
JWT_SECRET=nomediator_super_secret_key_change_in_production
PORT=4000
NODE_ENV=development
```

---

## Support

- Backend logs appear in Terminal 1
- Frontend logs appear in Terminal 2
- Check browser console for frontend errors
- See [BACKEND_SETUP.md](BACKEND_SETUP.md) for detailed troubleshooting

Good to go! 🚀
