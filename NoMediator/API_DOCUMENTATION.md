# NoMediator Backend API Documentation

## Base URL
- **Web/Desktop**: `http://localhost:4000`
- **Android Emulator**: `http://10.0.2.2:4000`
- **iOS Simulator**: `http://localhost:4000`
- **Production**: (to be defined)

## Content-Type
All requests and responses use `application/json`

---

## Authentication Endpoints

### 1. Register User

Create a new account

**Endpoint:**
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "password": "SecurePassword123"
}
```

**Parameters:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | Yes | Full name of user |
| email | string | Yes | Unique email address |
| phone | string | No | Phone number with country code |
| password | string | Yes | Min 6 chars recommended |

**Response (201 - Created):**
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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcxNjMwMDAwMCwiZXhwIjoxNzE2OTA0ODAwfQ.xyz..."
}
```

**Error (400 - Bad Request):**
```json
{
  "message": "Name, email, and password are required."
}
```

**Error (409 - Conflict):**
```json
{
  "message": "Email is already registered."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "password": "SecurePassword123"
  }'
```

**JavaScript/Fetch Example:**
```javascript
const response = await fetch('http://localhost:4000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    password: 'SecurePassword123'
  })
});
const data = await response.json();
console.log(data.token); // Save this token
```

---

### 2. Login User

Authenticate with email and password

**Endpoint:**
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Parameters:**
| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

**Response (200 - OK):**
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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz..."
}
```

**Error (400 - Bad Request):**
```json
{
  "message": "Email and password are required."
}
```

**Error (401 - Unauthorized):**
```json
{
  "message": "Invalid email or password."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

---

### 3. Get Current User

Get authenticated user's profile

**Endpoint:**
```
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 - OK):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "role": "Tenant",
    "created_at": "2026-05-21T10:00:00.000Z"
  }
}
```

**Error (401 - Unauthorized):**
```json
{
  "message": "Authorization header missing."
}
```

**Error (401 - Unauthorized):**
```json
{
  "message": "Invalid or expired token."
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz..."
```

**JavaScript/Fetch Example:**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz...';

const response = await fetch('http://localhost:4000/api/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data.user);
```

---

## Health Check Endpoint

### Health Status

Check if backend is running

**Endpoint:**
```
GET /api/health
```

**Response (200 - OK):**
```json
{
  "status": "ok"
}
```

**cURL Example:**
```bash
curl http://localhost:4000/api/health
```

---

## Token Management

### JWT Token Format

Tokens are JWT (JSON Web Tokens) with expiry of 7 days.

**Token Structure:**
```
Header.Payload.Signature

Header: { "alg": "HS256", "typ": "JWT" }
Payload: { "userId": 1, "iat": 1716300000, "exp": 1716904800 }
```

### Storing Tokens (Frontend)

**React Native (AsyncStorage):**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// After login
await AsyncStorage.setItem('auth_token', data.token);
await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));

// Before API calls
const token = await AsyncStorage.getItem('auth_token');
const headers = {
  'Authorization': `Bearer ${token}`
};

// On logout
await AsyncStorage.removeItem('auth_token');
await AsyncStorage.removeItem('auth_user');
```

**Web (localStorage):**
```javascript
// After login
localStorage.setItem('auth_token', data.token);
localStorage.setItem('auth_user', JSON.stringify(data.user));

// Before API calls
const token = localStorage.getItem('auth_token');
const headers = {
  'Authorization': `Bearer ${token}`
};

// On logout
localStorage.removeItem('auth_token');
localStorage.removeItem('auth_user');
```

---

## Error Handling

### Common HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Invalid/missing token or credentials |
| 409 | Conflict | Resource already exists (e.g., email) |
| 500 | Server Error | Backend issue, try again later |

### Error Response Format

```json
{
  "message": "Error description here"
}
```

---

## Rate Limiting

Currently no rate limiting. Production setup should add:
- Max 10 login attempts per IP per 15 minutes
- Max 5 registrations per IP per hour

---

## Security Considerations

### Passwords

- ✅ Passwords are hashed with bcrypt (10 salt rounds)
- ✅ Never returned in API responses
- ✅ Minimum 6 characters recommended

### Tokens

- ✅ JWT tokens expire after 7 days
- ✅ Only accessible via Authorization header
- ✅ Should be stored securely (AsyncStorage/localStorage)
- ⚠️ Never log or transmit tokens over unencrypted connections in production

### CORS

- ✅ CORS enabled for all origins (in development)
- ⚠️ Should be restricted to specific domains in production

---

## Database Schema

### users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Tenant',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Columns:**
- `id`: Unique user ID
- `name`: User's full name
- `email`: User's email (unique)
- `phone`: User's phone number
- `password`: Bcrypt hashed password
- `role`: User role (currently 'Tenant', extensible for 'Owner', 'Admin', etc.)
- `created_at`: Account creation timestamp

---

## Testing Workflow

### 1. Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+91 9876543210",
    "password": "Test123"
  }'
```

### 2. Save Token
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz..."
```

### 3. Get Current User
```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Login Again
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123"
  }'
```

---

## Future Endpoints

Planned endpoints to implement:

```
// Properties
POST   /api/properties              - Create property listing
GET    /api/properties              - Get all properties (with filters)
GET    /api/properties/:id          - Get property details
PUT    /api/properties/:id          - Update property
DELETE /api/properties/:id          - Delete property

// Search & Filter
GET    /api/properties/search       - Search properties
GET    /api/properties/filter       - Filter properties

// Favorites
POST   /api/favorites               - Save property
DELETE /api/favorites/:id           - Remove saved property
GET    /api/user/favorites          - Get user's saved properties

// Profile
GET    /api/user/profile            - Get user profile
PUT    /api/user/profile            - Update user profile
```

---

## Support & Issues

- Check backend logs: Look at terminal running `npm start`
- Test health endpoint: `curl http://localhost:4000/api/health`
- Verify database: `psql -U nomediator_user -d nomediator`
- See [BACKEND_SETUP.md](BACKEND_SETUP.md) for troubleshooting
