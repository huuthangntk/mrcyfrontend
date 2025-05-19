requests that are related to 2FA should also have an authorization header with the accessToken of the user as their value with a Bearer at the start.

a correct request in cURL will look like this:

curl --location 'http://localhost:4000/api/2fa/status' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3NDc1NzQ3MjcsImV4cCI6MTc0NzU3NTYyN30.KtK0m05AwoBUU-YUuIsGkwwEfcJl2PRMId9bZDkQ5Ec
' \
--header 'Content-Type: application/json' \
--data-raw '{
    "currentPassword": "H@m!dT3la123452",
    "newPassword": "H@m!dT3la123452"
}'

but currently it wont add the Authorization header and that leads to a 401 Unathorized error.

After you fixed the problem and placed the Authorization header, then if we encounter a 401 Unathorized Error, it means our token is expired and we need to refresh the token using the documentation that explained it below:

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

# Two-Factor Authentication (2FA) Flow

This document outlines the complete flow for implementing two-factor authentication in the frontend application.

## 2FA Activation Flow

1. **Check 2FA Status**
   - Call `GET /api/2fa/status` to check if 2FA is already enabled
   - This requires authentication (JWT token in the Authorization header)

2. **Initiate 2FA Setup**
   - Call `POST /api/2fa/enable` with the user's JWT token
   - The backend will generate a new TOTP secret and return:
     ```json
     {
       "message": "2FA enabled successfully",
       "code": "2FA_ENABLED",
       "secret": "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
     }
     ```
   - The `secret` is the TOTP secret key that will be used for verification

3. **Display QR Code to User**
   - The API response contains a Base32 encoded secret
   - Use a QR code library to generate a QR code with the following URI format:
     ```
     otpauth://totp/YourApp:{userId}?secret={secret}&issuer=YourApp
     ```
   - Display the QR code to the user with instructions to scan it with an authenticator app (Google Authenticator, Authy, etc.)
   - Also display the secret key as text for manual entry

4. **Verify 2FA Setup**
   - Ask the user to enter the 6-digit code from their authenticator app
   - Call `POST /api/2fa/verify` with:
     ```json
     {
       "userId": 1,
       "code": "123456"
     }
     ```
   - If successful, the backend will enable 2FA for the user and return:
     ```json
     {
       "message": "2FA code verified successfully",
       "code": "2FA_VERIFIED"
     }
     ```
   - If the code is invalid, show an error message and let the user try again

5. **Confirmation**
   - Show a success message to the user confirming 2FA has been activated
   - Inform the user that they will need their authenticator app for future logins

## Login Flow with 2FA Enabled

1. **Standard Login**
   - User enters email and password
   - Call `POST /api/auth/login` with credentials
   - If 2FA is enabled, the API will return:
     ```json
     {
       "message": "Require 2FA Code from Two Factor Authentication application",
       "code": "2FA_REQUEST",
       "userId": 1
     }
     ```

2. **2FA Verification**
   - Display a screen asking for the 6-digit code from the authenticator app
   - Call `POST /api/auth/verify-login-app` with:
     ```json
     {
       "userId": 1,
       "code": "123456"
     }
     ```

3. **Complete Login**
   - If the code is valid, the API will return the user's details and tokens:
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
   - Use these tokens for authenticated API requests

## Disabling 2FA

1. **Authenticate User**
   - User must be logged in (with valid JWT token)
   - Optionally, require the user to enter their password again for security

2. **Disable 2FA**
   - Call `POST /api/2fa/disable` with the JWT token
   - If successful, the API will return:
     ```json
     {
       "message": "2FA disabled successfully",
       "code": "2FA_DISABLED"
     }
     ```

3. **Confirmation**
   - Show a confirmation message that 2FA has been disabled
   - Inform the user about the security implications

## Error Handling

- **Invalid 2FA Code**: If the user enters an invalid code, display an appropriate error message and allow them to try again.
- **Network Errors**: Implement retry mechanisms for API calls in case of network issues.
- **Session Expiry**: If the user's session expires during the 2FA setup process, redirect to the login page.

## Best Practices

1. **Recovery Options**: Consider implementing backup codes or alternative recovery methods if users lose access to their authenticator app.
2. **Progressive Enhancement**: Ensure the application works even if JavaScript is disabled or encountering errors.
3. **Security Information**: Provide clear information about 2FA and its security benefits.
4. **Accessibility**: Ensure 2FA setup and verification flows are accessible to all users. 