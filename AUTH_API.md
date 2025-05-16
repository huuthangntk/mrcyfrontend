# Authentication API Specification

This document outlines the API endpoints for the authentication system. It serves as a reference for frontend developers to connect with the backend.

## Base URL

All endpoints are relative to the base URL:

`http://localhost:4000` (Development)

## Authentication

Most endpoints require authentication via a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register User

Creates a new user account and sends a verification email with both a verification link and a 6-digit code.

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Rate Limited**: Yes, one attempt per email every 2 minutes (only applied after successful email sending)

#### Request Headers

```
Content-Type: application/json
```

#### Request Body

```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "password": "Password123!"
}
```

#### Success Response

- **Code**: `201 Created`
- **Content**:

```json
{
  "message": "User registered successfully. Please verify your email.",
  "userId": 1
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing required fields | `{ "message": "Username, email and password are required" }` |
| 400 | Invalid password format | `{ "message": "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character" }` |
| 409 | User already exists | `{ "message": "User with this email or username already exists" }` |
| 429 | Rate limit exceeded | `{ "message": "Too many registration attempts for this email. Please try again in 2 minute(s)." }` |
| 500 | Server error | `{ "message": "Server error during registration" }` |

---

### Verify Email

Verifies a user's email address using the verification token.

- **URL**: `/api/auth/verify-email/:token`
- **Method**: `GET`
- **Auth Required**: No

#### URL Parameters

- `token`: Email verification token sent to the user's email

#### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "Email verified successfully"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Invalid token | `{ "message": "Invalid or expired verification token" }` |
| 500 | Server error | `{ "message": "Server error during email verification" }` |

---

### Verify Email with Code

Verifies a user's email address using the 6-digit verification code.

- **URL**: `/api/auth/verify-code`
- **Method**: `POST`
- **Auth Required**: No

#### Request Headers

```
Content-Type: application/json
```

#### Request Body

```json
{
  "email": "john.doe@example.com",
  "code": "123456"
}
```

#### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "Email verified successfully"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing fields | `{ "message": "Email and code are required" }` |
| 400 | Invalid code | `{ "message": "Invalid or expired verification code" }` |
| 500 | Server error | `{ "message": "Server error during email verification" }` |

---

### Login

Authenticates a user and issues access and refresh tokens.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Rate Limited**: Yes, protects against brute force attacks

#### Request Headers

```
Content-Type: application/json
```

#### Request Body

```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

#### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "userId": 1,
  "username": "johndoe",
  "fullName": "John Doe",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Note: If the user has 2FA enabled, the response will be different and require additional verification.

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing credentials | `{ "message": "Email and password are required" }` |
| 401 | Invalid credentials | `{ "message": "Invalid credentials" }` |
| 403 | Email not verified | `{ "message": "Please verify your email before logging in" }` |
| 429 | Too many attempts | `{ "message": "Too many login attempts. Please try again later." }` |
| 500 | Server error | `{ "message": "Server error during login" }` |

---

### Refresh Token

Issues a new access token using a valid refresh token.

- **URL**: `/api/auth/refresh-token`
- **Method**: `POST`
- **Auth Required**: No

#### Request Headers

```
Content-Type: application/json
```

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing refresh token | `{ "message": "Refresh token is required" }` |
| 401 | Invalid refresh token | `{ "message": "Invalid refresh token" }` |
| 401 | Expired refresh token | `{ "message": "Refresh token expired" }` |
| 500 | Server error | `{ "message": "Server error during token refresh" }` |

---

### Forgot Password

Sends a password reset email to the user.

- **URL**: `/api/auth/forgot-password`
- **Method**: `POST`
- **Auth Required**: No
- **Rate Limited**: Yes, one attempt per email every 2 minutes (only applied after successful email sending)

#### Request Headers

```
Content-Type: application/json
```

#### Request Body

```json
{
  "email": "john.doe@example.com"
}
```

#### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "If your email is registered, you will receive a password reset link"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing email | `{ "message": "Email is required" }` |
| 500 | Server error | `{ "message": "Server error during password reset request" }` |

---

### Reset Password

Resets a user's password using a valid reset token.

- **URL**: `/api/auth/reset-password`
- **Method**: `POST`
- **Auth Required**: No

#### Request Headers

```
Content-Type: application/json
```

#### Request Body

```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "NewPassword123!"
}
```

#### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "Password reset successful"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing token or password | `{ "message": "Token and new password are required" }` |
| 400 | Invalid password format | `{ "message": "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character" }` |
| 400 | Invalid or expired token | `{ "message": "Invalid or expired reset token" }` |
| 500 | Server error | `{ "message": "Server error during password reset" }` |

---

### Logout

Invalidates a refresh token, effectively logging the user out.

- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Auth Required**: No

#### Request Headers

```
Content-Type: application/json
```

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "Logged out successfully"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing refresh token | `{ "message": "Refresh token is required" }` |
| 500 | Server error | `{ "message": "Server error during logout" }` |

---

## User Management Endpoints

### Get Current User Profile

Retrieves the profile of the currently authenticated user.

- **URL**: `/api/users/me`
- **Method**: `GET`
- **Auth Required**: Yes

#### Request Headers

```
Authorization: Bearer <access_token>
```

#### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "isVerified": true,
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 401 | Unauthorized | `{ "message": "Unauthorized" }` |
| 404 | User not found | `{ "message": "User not found" }` |
| 500 | Server error | `{ "message": "Server error while retrieving user profile" }` |

---

### Update User Profile

Updates the profile of the currently authenticated user.

- **URL**: `/api/users/me`
- **Method**: `PUT`
- **Auth Required**: Yes

#### Request Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "fullName": "John Smith Doe",
  "username": "johnsdoe"
}
```

#### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "Profile updated successfully"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 401 | Unauthorized | `{ "message": "Unauthorized" }` |
| 409 | Username taken | `{ "message": "Username is already taken" }` |
| 500 | Server error | `{ "message": "Server error while updating profile" }` |

---

### Change Password

Changes the password of the currently authenticated user.

- **URL**: `/api/users/change-password`
- **Method**: `POST`
- **Auth Required**: Yes

#### Request Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!"
}
```

#### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "Password changed successfully"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing passwords | `{ "message": "Current password and new password are required" }` |
| 400 | Invalid password format | `{ "message": "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character" }` |
| 401 | Incorrect password | `{ "message": "Current password is incorrect" }` |
| 401 | Unauthorized | `{ "message": "Unauthorized" }` |
| 500 | Server error | `{ "message": "Server error while changing password" }` |

---

## Two-Factor Authentication Endpoints

### Enable 2FA

Enables two-factor authentication for the currently authenticated user.

- **URL**: `/api/2fa/enable`
- **Method**: `POST`
- **Auth Required**: Yes

#### Request Headers

```
Authorization: Bearer <access_token>
```

#### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "2FA enabled successfully",
  "secret": "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 401 | Unauthorized | `{ "message": "Unauthorized" }` |
| 500 | Server error | `{ "message": "Server error while enabling 2FA" }` |

---

### Disable 2FA

Disables two-factor authentication for the currently authenticated user.

- **URL**: `/api/2fa/disable`
- **Method**: `POST`
- **Auth Required**: Yes

#### Request Headers

```
Authorization: Bearer <access_token>
```

#### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "2FA disabled successfully"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | 2FA not enabled | `{ "message": "2FA is not enabled for this user" }` |
| 401 | Unauthorized | `{ "message": "Unauthorized" }` |
| 500 | Server error | `{ "message": "Server error while disabling 2FA" }` |

---

### Get 2FA Status

Retrieves the 2FA status of the currently authenticated user.

- **URL**: `/api/2fa/status`
- **Method**: `GET`
- **Auth Required**: Yes

#### Request Headers

```
Authorization: Bearer <access_token>
```

#### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "isEnabled": true
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 401 | Unauthorized | `{ "message": "Unauthorized" }` |
| 500 | Server error | `{ "message": "Server error while getting 2FA status" }` |

---

### Verify 2FA Code

Verifies a 2FA code during login.

- **URL**: `/api/2fa/verify`
- **Method**: `POST`
- **Auth Required**: No

#### Request Headers

```
Content-Type: application/json
```

#### Request Body

```json
{
  "userId": 1,
  "code": "123456"
}
```

#### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "2FA code verified successfully"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing fields | `{ "message": "User ID and code are required" }` |
| 400 | 2FA not enabled | `{ "message": "2FA is not enabled for this user" }` |
| 401 | Invalid code | `{ "message": "Invalid 2FA code" }` |
| 500 | Server error | `{ "message": "Server error while verifying 2FA code" }` |

---

## HTTP Status Codes

- `200 OK`: The request succeeded
- `201 Created`: A new resource was created
- `400 Bad Request`: The request was malformed or invalid
- `401 Unauthorized`: Authentication failed or user not authenticated
- `403 Forbidden`: User is authenticated but not authorized to access the resource
- `404 Not Found`: The requested resource was not found
- `409 Conflict`: The request conflicts with the current state of the server
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: An unexpected error occurred on the server

## Error Response Format

All errors return a JSON object with a `message` field describing the error:

```json
{
  "message": "Description of the error"
}
``` 