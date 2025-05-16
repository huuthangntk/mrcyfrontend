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
| 400 | Invalid code | `{ "message": "Invalid or expired verification code", "code": "INVALID_VERIFICATION_CODE" }` |
| 500 | Server error | `{ "message": "Server error during email verification", "code": "EMAIL_VERIFICATION_ERROR" }` |

---

### Login

Authenticates a user and initiates the two-step verification process.

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

#### Success Response (with 2FA enabled)

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "Require 2FA Code from Two Factor Authentication application",
  "code": "2FA_REQUEST",
  "userId": 1
}
```

#### Success Response (without 2FA enabled)

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "Verification code sent to your email",
  "code": "EMAIL_VERIFICATION_REQUIRED",
  "userId": 1
}
```

Note: When 2FA is not enabled, the system automatically sends a verification email with a 6-digit code and a verification link.

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing credentials | `{ "message": "Email and password are required", "code": "MISSING_CREDENTIALS" }` |
| 401 | Invalid credentials | `{ "message": "Invalid credentials", "code": "INVALID_CREDENTIALS" }` |
| 403 | Email not verified | `{ "message": "Please verify your email before logging in", "code": "EMAIL_NOT_VERIFIED" }` |
| 429 | Too many attempts | `{ "message": "Too many login attempts. Please try again later.", "code": "LOGIN_RATE_LIMIT" }` |
| 500 | Server error | `{ "message": "Server error during login", "code": "LOGIN_ERROR" }` |

---

### Verify Login with 2FA App

Verifies a login attempt using the 6-digit code from a 2FA authentication app.

- **URL**: `/api/auth/verify-login-app`
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
  "userId": 1,
  "username": "johndoe",
  "fullName": "John Doe",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "code": "LOGIN_SUCCESS"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing fields | `{ "message": "User ID and code are required", "code": "MISSING_REQUIRED_FIELDS" }` |
| 401 | Invalid code | `{ "message": "Invalid 2FA code", "code": "INVALID_2FA_CODE" }` |
| 500 | Server error | `{ "message": "Server error during login verification", "code": "LOGIN_ERROR" }` |

---

### Verify Login with Email Code

Verifies a login attempt using the 6-digit verification code sent via email.

- **URL**: `/api/auth/verify-login-email`
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
  "userId": 1,
  "username": "johndoe",
  "fullName": "John Doe",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "code": "LOGIN_SUCCESS"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing fields | `{ "message": "User ID and code are required", "code": "MISSING_REQUIRED_FIELDS" }` |
| 401 | Invalid code | `{ "message": "Invalid or expired verification code", "code": "INVALID_VERIFICATION_CODE" }` |
| 500 | Server error | `{ "message": "Server error during login verification", "code": "LOGIN_ERROR" }` |

---

### Verify Login with Email Token

Verifies a login attempt using the verification token sent via email link.

- **URL**: `/api/auth/verify-login-email/:token`
- **Method**: `GET`
- **Auth Required**: No

#### URL Parameters

- `token`: Verification token sent to the user's email

#### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
  "userId": 1,
  "username": "johndoe",
  "fullName": "John Doe",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "code": "LOGIN_SUCCESS"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Invalid token | `{ "message": "Invalid or expired verification token", "code": "INVALID_VERIFICATION_TOKEN" }` |
| 500 | Server error | `{ "message": "Server error during login verification", "code": "LOGIN_ERROR" }` |

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
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "code": "TOKEN_REFRESH_SUCCESS"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing refresh token | `{ "message": "Refresh token is required", "code": "MISSING_REFRESH_TOKEN" }` |
| 401 | Invalid refresh token | `{ "message": "Invalid refresh token", "code": "INVALID_REFRESH_TOKEN" }` |
| 401 | Expired refresh token | `{ "message": "Refresh token expired", "code": "EXPIRED_REFRESH_TOKEN" }` |
| 500 | Server error | `{ "message": "Server error during token refresh", "code": "TOKEN_REFRESH_ERROR" }` |

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
  "message": "Logged out successfully",
  "code": "LOGOUT_SUCCESS"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing refresh token | `{ "message": "Refresh token is required", "code": "MISSING_REFRESH_TOKEN" }` |
| 500 | Server error | `{ "message": "Server error during logout", "code": "LOGOUT_ERROR" }` |

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
  "createdAt": "2023-01-01T00:00:00.000Z",
  "code": "USER_PROFILE_RETRIEVED"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 401 | Unauthorized | `{ "message": "Unauthorized", "code": "UNAUTHORIZED" }` |
| 404 | User not found | `{ "message": "User not found", "code": "USER_NOT_FOUND" }` |
| 500 | Server error | `{ "message": "Server error while retrieving user profile", "code": "PROFILE_ERROR" }` |

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
  "message": "Profile updated successfully",
  "code": "PROFILE_UPDATE_SUCCESS"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 401 | Unauthorized | `{ "message": "Unauthorized", "code": "UNAUTHORIZED" }` |
| 409 | Username taken | `{ "message": "Username is already taken", "code": "USERNAME_TAKEN" }` |
| 500 | Server error | `{ "message": "Server error while updating profile", "code": "PROFILE_UPDATE_ERROR" }` |

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
  "message": "Password changed successfully",
  "code": "PASSWORD_CHANGE_SUCCESS"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing passwords | `{ "message": "Current password and new password are required", "code": "MISSING_PASSWORD_FIELDS" }` |
| 400 | Invalid password format | `{ "message": "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character", "code": "INVALID_PASSWORD_FORMAT" }` |
| 401 | Incorrect password | `{ "message": "Current password is incorrect", "code": "INCORRECT_PASSWORD" }` |
| 401 | Unauthorized | `{ "message": "Unauthorized", "code": "UNAUTHORIZED" }` |
| 500 | Server error | `{ "message": "Server error while changing password", "code": "PASSWORD_CHANGE_ERROR" }` |

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
  "code": "2FA_ENABLED",
  "secret": "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 401 | Unauthorized | `{ "message": "Unauthorized", "code": "UNAUTHORIZED" }` |
| 500 | Server error | `{ "message": "Server error while enabling 2FA", "code": "2FA_ERROR" }` |

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
  "message": "2FA disabled successfully",
  "code": "2FA_DISABLED"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | 2FA not enabled | `{ "message": "2FA is not enabled for this user", "code": "2FA_DISABLE_ERROR" }` |
| 401 | Unauthorized | `{ "message": "Unauthorized", "code": "UNAUTHORIZED" }` |
| 500 | Server error | `{ "message": "Server error while disabling 2FA", "code": "2FA_ERROR" }` |

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
  "isEnabled": true,
  "code": "2FA_STATUS_RETRIEVED"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 401 | Unauthorized | `{ "message": "Unauthorized", "code": "UNAUTHORIZED" }` |
| 500 | Server error | `{ "message": "Server error while getting 2FA status", "code": "2FA_ERROR" }` |

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
  "message": "2FA code verified successfully",
  "code": "2FA_VERIFIED"
}
```

#### Error Responses

| Status Code | Description | Response |
|-------------|-------------|----------|
| 400 | Missing fields | `{ "message": "User ID and code are required", "code": "MISSING_2FA_FIELDS" }` |
| 400 | 2FA not enabled | `{ "message": "2FA is not enabled for this user", "code": "2FA_DISABLE_ERROR" }` |
| 401 | Invalid code | `{ "message": "Invalid 2FA code", "code": "INVALID_2FA_CODE" }` |
| 500 | Server error | `{ "message": "Server error while verifying 2FA code", "code": "2FA_ERROR" }` |

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

The API returns the following standardized response codes to help with programmatic handling of responses:

| Code | Description |
|------|-------------|
| REGISTRATION_SUCCESS | User registered successfully |
| MISSING_REQUIRED_FIELDS | Required fields are missing from the request |
| INVALID_PASSWORD_FORMAT | Password does not meet the required format (8+ chars, uppercase, lowercase, number, special char) |
| DUPLICATED_EMAIL_OR_USERNAME | The provided email or username is already in use |
| REGISTRATION_RATE_LIMIT | Too many registration attempts from the same email |
| REGISTRATION_ERROR | Server error occurred during registration |
| EMAIL_VERIFICATION_SUCCESS | Email was successfully verified |
| INVALID_VERIFICATION_TOKEN | Verification token is invalid or expired |
| INVALID_VERIFICATION_CODE | Verification code is invalid or expired |
| EMAIL_VERIFICATION_ERROR | Server error occurred during email verification |
| REQUIRE_2FA_CODE | User has 2FA enabled and needs to provide a code |
| EMAIL_VERIFICATION_REQUIRED | Verification code has been sent to the user's email |
| MISSING_CREDENTIALS | Email or password is missing |
| INVALID_CREDENTIALS | Provided credentials are incorrect |
| EMAIL_NOT_VERIFIED | User needs to verify their email before logging in |
| LOGIN_RATE_LIMIT | Too many login attempts |
| LOGIN_ERROR | Server error occurred during login |
| LOGIN_SUCCESS | Login was successful |
| TOKEN_REFRESH_SUCCESS | Access token was successfully refreshed |
| MISSING_REFRESH_TOKEN | Refresh token is missing |
| INVALID_REFRESH_TOKEN | Refresh token is invalid |
| EXPIRED_REFRESH_TOKEN | Refresh token has expired |
| TOKEN_REFRESH_ERROR | Server error occurred during token refresh |
| PASSWORD_RESET_REQUESTED | Password reset request received |
| MISSING_EMAIL | Email is missing from the request |
| PASSWORD_RESET_REQUEST_ERROR | Server error occurred during password reset request |
| MISSING_RESET_FIELDS | Token or new password is missing |
| INVALID_RESET_TOKEN | Reset token is invalid or expired |
| PASSWORD_RESET_SUCCESS | Password was reset successfully |
| PASSWORD_RESET_ERROR | Server error occurred during password reset |
| LOGOUT_SUCCESS | User was logged out successfully |
| LOGOUT_ERROR | Server error occurred during logout |
| USER_PROFILE_RETRIEVED | User profile retrieved successfully |
| UNAUTHORIZED | User is not authorized to access this resource |
| USER_NOT_FOUND | The requested user was not found |
| PROFILE_ERROR | Server error occurred while retrieving profile |
| PROFILE_UPDATE_SUCCESS | User profile updated successfully |
| USERNAME_TAKEN | The requested username is already taken |
| PROFILE_UPDATE_ERROR | Server error occurred while updating profile |
| MISSING_PASSWORD_FIELDS | Current or new password is missing |
| INCORRECT_PASSWORD | Current password is incorrect |
| PASSWORD_CHANGE_SUCCESS | Password changed successfully |
| PASSWORD_CHANGE_ERROR | Server error occurred while changing password |
| 2FA_ENABLED | Two-factor authentication enabled successfully |
| 2FA_DISABLED | Two-factor authentication disabled successfully |
| 2FA_STATUS_RETRIEVED | Two-factor authentication status retrieved |
| 2FA_VERIFIED | Two-factor authentication code verified successfully |
| 2FA_DISABLE_ERROR | Two-factor authentication is not enabled |
| MISSING_2FA_FIELDS | Two-factor authentication fields are missing |
| INVALID_2FA_CODE | Two-factor authentication code is invalid |
| 2FA_ERROR | Server error occurred with two-factor authentication | 