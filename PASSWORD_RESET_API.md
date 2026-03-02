# Password Reset API Documentation

## Overview

The password reset system allows users to securely reset their passwords via email verification. The system uses time-limited tokens and SMTP email delivery.

## Endpoints

### 1. Request Password Reset

**POST** `/auth/forgot-password`

Initiates the password reset process by sending a reset link to the user's email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`

```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Notes:**

- Always returns success to prevent email enumeration attacks
- Generates a secure random token (32 bytes)
- Token is valid for 1 hour
- Sends email with reset link to frontend route

**Email Example:**
The user receives an email with a link like:

```
http://localhost:5173/reset-password?token=abc123...xyz789
```

---

### 2. Reset Password

**POST** `/auth/reset-password`

Resets the user's password using the token from the email.

**Request Body:**

```json
{
  "token": "abc123...xyz789",
  "newPassword": "NewSecure123"
}
```

**Validation Rules:**

- `token`: Required
- `newPassword`:
  - Minimum 8 characters
  - Must contain uppercase letter
  - Must contain lowercase letter
  - Must contain number

**Success Response:** `200 OK`

```json
{
  "message": "Password has been successfully reset"
}
```

**Error Response:** `401 Unauthorized`

```json
{
  "statusCode": 401,
  "message": "Invalid or expired reset token"
}
```

---

## Security Features

### Token Security

- Tokens are hashed before storing in database (bcrypt)
- Raw token is only sent via email, never stored
- Tokens expire after 1 hour
- Single-use tokens (cleared after successful reset)

### Email Enumeration Prevention

- Forgot password always returns success message
- Doesn't reveal if email exists or not
- Failed email sends are logged but don't throw errors

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

## Database Schema

New fields added to `users` table:

```typescript
@Column({ nullable: true })
resetPasswordToken?: string;  // Hashed token

@Column({ type: 'timestamp', nullable: true })
resetPasswordExpires?: Date;  // Token expiry time
```

---

## SMTP Configuration

Required environment variables in `.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com          # Your SMTP server
SMTP_PORT=587                     # Usually 587 for TLS, 465 for SSL
SMTP_SECURE=false                 # true for 465, false for 587
SMTP_USER=your-email@gmail.com    # SMTP username
SMTP_PASS=your-app-password       # SMTP password or app password
SMTP_FROM_NAME=IPTV4EVER         # Sender name
SMTP_FROM_EMAIL=your-email@gmail.com  # Sender email
```

### Gmail Setup Example

1. **Enable 2-Factor Authentication** on your Google account

2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASS`

3. **Update .env:**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=youremail@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM_NAME=IPTV4EVER
SMTP_FROM_EMAIL=youremail@gmail.com
```

### Alternative SMTP Providers

**SendGrid:**

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun:**

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.mailgun.org
SMTP_PASS=your-mailgun-password
```

**Amazon SES:**

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

---

## Complete Flow

### User Flow

1. User goes to forgot password page
2. Enters email address
3. Clicks "Send Reset Link"
4. Receives email with reset link
5. Clicks link → redirected to reset password page with token
6. Enters new password
7. Password is reset successfully

### Backend Flow

**Forgot Password:**

```mermaid
POST /auth/forgot-password
    ↓
Find user by email
    ↓
Generate random token (32 bytes)
    ↓
Hash token with bcrypt
    ↓
Save hashed token + expiry to database
    ↓
Send email with raw token in URL
    ↓
Return success message
```

**Reset Password:**

```mermaid
POST /auth/reset-password
    ↓
Find users with non-expired tokens
    ↓
Compare raw token with hashed tokens
    ↓
Find matching user
    ↓
Hash new password
    ↓
Update password + clear reset token
    ↓
Return success message
```

---

## Testing

### 1. Request Reset (using curl)

```bash
curl -X POST http://localhost:5001/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 2. Check Email

Look for reset link in the email inbox

### 3. Reset Password

```bash
curl -X POST http://localhost:5001/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"TOKEN_FROM_EMAIL",
    "newPassword":"NewSecure123"
  }'
```

### 4. Test Login with New Password

```bash
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"NewSecure123"
  }'
```

---

## Error Handling

| Scenario        | Response                           |
| --------------- | ---------------------------------- |
| Email not found | 200 OK (security - don't reveal)   |
| Invalid token   | 401 Unauthorized                   |
| Expired token   | 401 Unauthorized                   |
| Weak password   | 400 Bad Request (validation error) |
| SMTP error      | 200 OK (logged server-side)        |

---

## Frontend Integration

The frontend should implement:

1. **Forgot Password Page** (`/forgot-password`)
   - Input: email
   - Calls: `POST /auth/forgot-password`
   - Shows success message

2. **Reset Password Page** (`/reset-password`)
   - Reads token from URL query params
   - Input: new password, confirm password
   - Calls: `POST /auth/reset-password`
   - Redirects to login on success

**Example Frontend Route:**

```typescript
// React Router
<Route path="/reset-password" element={<ResetPasswordPage />} />

// In ResetPasswordPage component
const token = new URLSearchParams(location.search).get('token');
```

---

## Production Checklist

- [ ] Configure production SMTP server
- [ ] Use secure SMTP credentials (environment variables)
- [ ] Set production `FRONTEND_URL` in .env
- [ ] Enable HTTPS for reset links
- [ ] Monitor failed email sends
- [ ] Set appropriate token expiry time
- [ ] Add rate limiting on forgot-password endpoint
- [ ] Log password reset activities
- [ ] Consider adding email verification

---

## Next Steps

After backend is complete, implement frontend:

1. Create forgot password form
2. Create reset password form
3. Add token validation
4. Add success/error notifications
5. Add redirect after successful reset
