# Registration API Specification

This document outlines the API endpoints for the registration system. It serves as a reference for frontend developers to connect with the backend.

## Base URL

All endpoints are relative to the base URL:

`http://localhost:4000` (Development)

## Authentication

Most endpoints require authentication via a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Registration Endpoints

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
  "code": "REGISTRATION_SUCCESS",
  "userId": 1
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing required fields | `{ "message": "Username, email and password are required", "code": "MISSING_REQUIRED_FIELDS" }` |
| 400 | Invalid password format | `{ "message": "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character", "code": "INVALID_PASSWORD_FORMAT" }` |
| 409 | User already exists | `{ "message": "User with this email or username already exists", "code": "DUPLICATED_EMAIL_OR_USERNAME" }` |
| 429 | Rate limit exceeded | `{ "message": "Too many registration attempts for this email. Please try again in 2 minute(s).", "code": "REGISTRATION_RATE_LIMIT" }` |
| 500 | Server error | `{ "message": "Server error during registration", "code": "REGISTRATION_ERROR" }` |

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
  "message": "Email verified successfully",
  "code": "EMAIL_VERIFICATION_SUCCESS",
  "userId": 1,
  "username": "johndoe",
  "fullName": "John Doe",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Invalid token | `{ "message": "Invalid or expired verification token", "code": "INVALID_VERIFICATION_TOKEN" }` |
| 500 | Server error | `{ "message": "Server error during email verification", "code": "EMAIL_VERIFICATION_ERROR" }` |

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
  "message": "Email verified successfully",
  "code": "EMAIL_VERIFICATION_SUCCESS",
  "userId": 1,
  "username": "johndoe",
  "fullName": "John Doe",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing fields | `{ "message": "Email and code are required", "code": "MISSING_REQUIRED_FIELDS" }` |
| 400 | Invalid or expired code | `{ "message": "Invalid or expired verification code (codes expire after 2 minutes)", "code": "INVALID_VERIFICATION_CODE" }` |
| 500 | Server error | `{ "message": "Server error during email verification", "code": "EMAIL_VERIFICATION_ERROR" }` |

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
  "message": "If your email is registered, you will receive a password reset link",
  "code": "PASSWORD_RESET_REQUESTED"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing email | `{ "message": "Email is required", "code": "MISSING_EMAIL" }` |
| 500 | Server error | `{ "message": "Server error during password reset request", "code": "PASSWORD_RESET_REQUEST_ERROR" }` |

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
  "message": "Password reset successful",
  "code": "PASSWORD_RESET_SUCCESS"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing token or password | `{ "message": "Token and new password are required", "code": "MISSING_RESET_FIELDS" }` |
| 400 | Invalid password format | `{ "message": "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character", "code": "INVALID_PASSWORD_FORMAT" }` |
| 400 | Invalid or expired token | `{ "message": "Invalid or expired reset token", "code": "INVALID_RESET_TOKEN" }` |
| 500 | Server error | `{ "message": "Server error during password reset", "code": "PASSWORD_RESET_ERROR" }` |

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

## Response Codes

The API returns the following standardized response codes relevant to registration:

| Code | Description |
|------|-------------|
| REGISTRATION_SUCCESS | User registered successfully |
| MISSING_REQUIRED_FIELDS | Required fields are missing from the request |
| INVALID_PASSWORD_FORMAT | Password does not meet the required format (8+ chars, uppercase, lowercase, number, special char) |
| DUPLICATED_EMAIL_OR_USERNAME | The provided email or username is already in use |
| REGISTRATION_RATE_LIMIT | Too many registration attempts from the same email |
| REGISTRATION_ERROR | Server error occurred during registration |
| EMAIL_VERIFICATION_SUCCESS | Email was successfully verified |
| INVALID_VERIFICATION_TOKEN | Verification token is invalid or expired (expires after 2 minutes) |
| INVALID_VERIFICATION_CODE | Verification code is invalid or expired (expires after 2 minutes) |
| EMAIL_VERIFICATION_ERROR | Server error occurred during email verification |
| PASSWORD_RESET_REQUESTED | Password reset request received |
| MISSING_EMAIL | Email is missing from the request |
| PASSWORD_RESET_REQUEST_ERROR | Server error occurred during password reset request |
| MISSING_RESET_FIELDS | Token or new password is missing |
| INVALID_RESET_TOKEN | Reset token is invalid or expired |
| PASSWORD_RESET_SUCCESS | Password was reset successfully |
| PASSWORD_RESET_ERROR | Server error occurred during password reset | 