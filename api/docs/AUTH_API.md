# Authentication API Endpoints

Base URL: `http://localhost:5001/auth`

## Endpoints

### 1. Register New User

**POST** `/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "name": "John Doe",
  "password": "SecureP@ss123"
}
```

**Validation Rules:**
- `email`: Must be a valid email address
- `name`: 2-100 characters
- `password`: Minimum 8 characters, must include:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)

**Success Response (201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "1738362000000-abc123xyz",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "createdAt": "2026-01-31T22:00:00.000Z"
  }
}
```

**Error Response (409):**
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

---

### 2. Login

**POST** `/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecureP@ss123"
}
```

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "1738362000000-abc123xyz",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "createdAt": "2026-01-31T22:00:00.000Z"
  }
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

---

### 3. Get Profile (Protected)

**GET** `/auth/profile`

Returns the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "id": "1738362000000-abc123xyz",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "createdAt": "2026-01-31T22:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "You must be logged in to access this resource",
  "error": "Unauthorized"
}
```

---

### 4. Get Current User (Protected)

**GET** `/auth/me`

Returns the current authenticated user's information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "id": "1738362000000-abc123xyz",
  "email": "john.doe@example.com",
  "name": "John Doe"
}
```

---

### 5. Get All Users (Development Only)

**GET** `/auth/users`

Returns all registered users (remove in production).

**Success Response (200):**
```json
[
  {
    "id": "1738362000000-abc123xyz",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "createdAt": "2026-01-31T22:00:00.000Z"
  }
]
```

---

## Usage Examples

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "name": "John Doe",
    "password": "SecureP@ss123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecureP@ss123"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:5001/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### JavaScript/Fetch Examples

**Register:**
```javascript
const response = await fetch('http://localhost:5001/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john.doe@example.com',
    name: 'John Doe',
    password: 'SecureP@ss123',
  }),
});

const data = await response.json();
console.log(data.accessToken);
```

**Login:**
```javascript
const response = await fetch('http://localhost:5001/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john.doe@example.com',
    password: 'SecureP@ss123',
  }),
});

const data = await response.json();
localStorage.setItem('token', data.accessToken);
```

**Get Profile:**
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5001/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const profile = await response.json();
console.log(profile);
```

---

## Security Features

✅ **Password Hashing**: bcrypt with salt rounds (10)  
✅ **JWT Tokens**: Signed with secret key, 1-hour expiration  
✅ **Input Validation**: class-validator with strict rules  
✅ **DTO Pattern**: Separate DTOs for requests and responses  
✅ **Guards**: JWT authentication guard for protected routes  
✅ **CORS**: Configured for localhost and production domains  
✅ **Sanitization**: Passwords never returned in responses  

---

## Environment Variables

Add to `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
PORT=5001
```

---

## Best Practices Implemented

1. **DTOs with Validation**: All inputs validated with class-validator
2. **Password Security**: bcrypt hashing with salt
3. **JWT Strategy**: Passport JWT with proper validation
4. **Error Handling**: Proper HTTP status codes and messages
5. **Type Safety**: Full TypeScript with interfaces
6. **Guard Pattern**: JWT guard for protected routes
7. **Sanitization**: Remove sensitive data from responses
8. **API Documentation**: Swagger-ready decorators
