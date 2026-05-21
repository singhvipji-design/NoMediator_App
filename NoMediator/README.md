# NoMediator 🏠
**Zero Brokerage. Direct Owner.**

A NoBroker-inspired real estate rental app built with React Native + Expo.
Works on Web, Android, and iOS.

---

## Quick Start (3 steps)

```bash
# Step 1 - Install dependencies
npm install

# Step 2 - Install web dependencies
npx expo install react-native-web react-dom @expo/metro-runtime

# Step 3 - Start the app
npx expo start --web
```

Then press **`w`** for web, **`a`** for Android, **`i`** for iOS.

---

## Requirements
- Node.js v18 or v20 (NOT v22+)
- If you have Node v22+, run: `nvm use 20`

---

## Features

| Feature | Status |
|---------|--------|
| Login / Register | ✅ |
| Home with city filter | ✅ |
| Property type tabs (Full House, PG, Flatmates) | ✅ |
| Search & Filter | ✅ |
| Property Detail | ✅ |
| Contact Owner | ✅ |
| Schedule Visit | ✅ |
| Save / Favorites | ✅ |
| Post Property (4-step wizard) | ✅ |
| Services (Movers, Agreement, etc) | ✅ |
| User Profile | ✅ |
| Zero Brokerage banner | ✅ |

---

## Project Structure

```
NoMediator/
├── App.js
├── navigation/AppNavigator.js
├── context/AuthContext.js
├── screens/
│   ├── LoginScreen.js
│   ├── HomeScreen.js
│   ├── SearchScreen.js
│   ├── DetailScreen.js
│   ├── PostScreen.js
│   ├── SavedScreen.js
│   └── ProfileScreen.js
├── constants/
│   ├── theme.js
│   └── data.js
```

---

## Tech Stack
- React Native + Expo 51
- React Navigation v6
- Expo Linear Gradient
- @expo/vector-icons (Ionicons)
- React Native Web (for browser)
- Context API (Auth state)
- Node.js + Express backend
- PostgreSQL database for auth
- JWT-based login/register API

## Backend Setup
The backend is located in `backend/`.
1. Copy `backend/.env.example` to `backend/.env`.
2. Set `DATABASE_URL` to your PostgreSQL connection string.
3. Set `JWT_SECRET`.
4. Run `cd backend && npm install`.
5. Create the `users` table using `backend/migrations/init.sql`.
6. Start the server with `cd backend && npm start`.

API endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
