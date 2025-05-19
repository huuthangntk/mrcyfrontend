import { Translation } from '../config';

const en: Translation = {
  common: {
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    login: 'Login',
    register: 'Register',
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    supports: 'Supports:',
    selectLanguage: 'Select Language',
    showMore: 'Show More',
    showLess: 'Show Less',
    refresh: 'Refresh',
  },
  auth: {
    // Login Modal
    loginTitle: 'Login to Your Account',
    loginDescription: 'Enter your credentials to access your account',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember me',
    loggingIn: 'Logging in...',
    invalidCredentials: 'Invalid credentials. Please try again.',
    loginFailed: 'Login failed',

    // Register Modal
    registerTitle: 'Create an Account',
    registerDescription: 'Fill in your details to create your account',
    username: 'Username',
    fullName: 'Full Name',
    confirmPassword: 'Confirm Password',
    createAccount: 'Create Account',
    creatingAccount: 'Creating Account...',
    registrationFailed: 'Registration failed',
    passwordsDoNotMatch: 'Passwords do not match',
    acceptTerms: 'You must accept the terms and conditions',
    passwordTooWeak: 'Password is too weak',
    termsAndConditions: 'I accept the Terms and Conditions',

    // Common verification elements
    error: 'Error',
    verify: 'Verify',
    verifying: 'Verifying...',
    enterAllDigits: 'Please enter all 6 digits of the verification code',
    resendCodeIn: 'Resend code in',
    seconds: 'seconds',
    resendCode: 'Resend Code',
    sending: 'Sending...',

    // Error codes
    errorCodes: {
      DUPLICATED_EMAIL_OR_USERNAME: 'User with this email or username already exists',
      INVALID_EMAIL_FORMAT: 'Please enter a valid email address',
      INVALID_PASSWORD_FORMAT: 'Password does not meet the required criteria',
      REGISTRATION_FAILED: 'Registration failed. Please try again later',
      MISSING_REQUIRED_FIELDS: 'Please fill in all required fields',
      SERVER_ERROR: 'Server error. Please try again later'
    },

    // Password Strength
    passwordStrength: 'Password Strength:',
    weak: 'Weak',
    moderate: 'Moderate',
    strong: 'Strong',
    passwordRequirements: {
      minLength: 'At least 8 characters',
      lowercase: 'One lowercase letter',
      uppercase: 'One uppercase letter',
      number: 'One number',
      special: 'One special character'
    },

    // Email Verification Modal (Registration)
    verifyEmailTitle: 'Verify Your Email',
    verifyEmailDescription: 'We\'ve sent a 6-digit verification code to',
    enterCodeBelow: 'Enter the code below to verify your email',
    verifyEmail: 'Verify Email',
    emailVerified: 'Your email has been successfully verified.',
    invalidVerificationCode: 'Invalid verification code. Please try again.',

    // Two-Factor Authentication Modal
    twoFactorAuth: {
      title: 'Two-Factor Authentication',
      description: 'Enter the 6-digit code from your authenticator app',
      enterCode: 'Enter the code below to continue',
      invalidCode: 'Invalid authentication code. Please try again.',
      success: 'Authentication Successful',
      successMessage: 'Your identity has been verified successfully.',
      failedTitle: 'Authentication Failed'
    },

    // Login Email Verification Modal
    loginVerification: {
      title: 'Verify Your Login',
      description: 'We\'ve sent a 6-digit verification code to',
      enterCode: 'Enter the code below to continue login',
      codeSent: 'Verification code sent to',
      invalidCode: 'Invalid verification code. Please try again.',
      success: 'Verification Successful',
      successMessage: 'Your identity has been verified successfully.',
      failedTitle: 'Verification Failed',
      failed: 'Verification failed. Please try again.'
    },

    // Email Verification Page
    verification: {
      verifying: 'Verifying Your Email',
      pleaseWait: 'Please wait while we confirm your email address.',
      success: 'Email Verified Successfully!',
      successDescription: 'Your email has been verified. You can now log in to your account.',
      loginButton: 'Login to Your Account',
      failedTitle: 'Verification Failed',
      failed: 'An error occurred during verification. Please try again.',
      noToken: 'No verification token found. Please check your email link.',
      returnToLogin: 'Return to Login',
      resendButton: 'Resend Verification Email'
    },

    // Two-Factor Modal
    twoFactorTitle: 'Two-Factor Authentication',
    twoFactorDescription: 'Enter the 6-digit code from your authenticator app',
    codeRefreshesIn: 'Code refreshes in',
    getNewCode: 'Please get a new code from your app',

    // Forgot Password Modal
    resetPasswordTitle: 'Reset Your Password',
    resetLinkSent: 'Email Sent',
    resetPasswordDescription: 'We\'ll send you a link to reset your password',
    checkInbox: 'Check your inbox for the reset link',
    sendResetLink: 'Send Reset Link',
    redirecting: 'Redirecting you...',
    resetLinkSentMessage: 'If the email is registered, you will receive a password reset link.',

    // Reset Password Modal
    setNewPasswordTitle: 'Set New Password',
    createNewPassword: 'Create a new secure password for your account',
    newPassword: 'New Password',
    resetPassword: 'Reset Password',
    resettingPassword: 'Resetting Password...',
    passwordResetSuccess: 'Your password has been reset successfully!',
    redirectingToLogin: 'Redirecting to login...'
  },
  profile: {
    title: 'Profile Information',
    description: 'Update your account details',
    loading: 'Loading profile...',
    fullName: 'Full Name',
    username: 'Username',
    usernameDescription: 'This will be used for your profile URL',
    email: 'Email',
    emailDescription: 'Email cannot be changed directly. Contact support for assistance.',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    profileUpdated: 'Profile updated successfully',
    errorUpdating: 'Failed to update profile',
    tabs: {
      profile: 'Profile Information',
      password: 'Change Password',
      twoFactor: 'Two-Factor Authentication'
    }
  },
  security: {
    // Password Change Section
    passwordTitle: 'Password',
    passwordDescription: 'Change your password to keep your account secure',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    changePassword: 'Change Password',
    changingPassword: 'Changing Password...',
    passwordChanged: 'Password Changed Successfully',
    passwordChangeError: 'Failed to change password',
    passwordsDoNotMatch: 'New passwords do not match',
    invalidCurrentPassword: 'Current password is incorrect',
    error: 'Error',

    // 2FA Section
    twoFactorTitle: 'Two-Factor Authentication',
    twoFactorDescription: 'Add an extra layer of security to your account by requiring a verification code from your mobile device',
    loading: 'Loading...',

    // 2FA Disabled State
    twoFactorDisabledText: 'Two-factor authentication adds an extra layer of security to your account by requiring a verification code from your mobile device when you sign in.',
    recommendationText: 'We strongly recommend enabling two-factor authentication for your account security.',
    enable2FA: 'Enable 2FA',

    // 2FA Enabled State
    twoFactorEnabledText: 'Two-factor authentication is enabled for your account.',
    disable2FA: 'Disable 2FA',
    disabling: 'Disabling...',

    // 2FA Setup
    setupInstructions: `Scan this QR code with your authenticator app and then enter the verification code below. Keep your recovery codes in a safe place - you'll need them if you lose access to your authenticator app.`,

    important: 'Important',
    secretKey: 'Secret Key (if you can\'t scan the QR code)',
    secretKeyInstructions: 'Enter this code into your authenticator app if you can\'t scan the QR code. Use a TOTP-compatible app like Google Authenticator, Authy, or Microsoft Authenticator.',
    verificationCode: 'Verification Code',
    enterCurrentCode: 'Enter your authenticator code to disable 2FA',
    currentCodeInstructions: 'Enter a current valid code from your authenticator app to confirm it\'s you.',
    disableSecurity: 'Disabling two-factor authentication will reduce the security of your account. Anyone who knows your password will be able to log in.',
    cancel: 'Cancel',
    verifyAndActivate: 'Verify and Activate',

    // 2FA Status Messages
    twoFactorEnabled: '2FA Enabled Successfully',
    twoFactorEnabledDescription: 'Your account is now protected with two-factor authentication.',
    twoFactorDisabled: '2FA Disabled',
    twoFactorDisabledDescription: 'Two-factor authentication has been disabled for your account.',
    twoFactorSetupError: 'Failed to set up two-factor authentication',
    invalidCode: 'Invalid Code',
    enterValidCode: 'Please enter a valid 6-digit code',
    verificationFailed: 'Verification failed. Please try again with a new code.',
    verificationError: 'An error occurred during verification',
    disableError: 'Failed to disable two-factor authentication',
    missingUserData: 'User information not available'
  },
  hero: {
    title: 'Mercy - Empowering',
    subtitle: 'Digital Finance',
    description: 'Secure, fast, and innovative cryptocurrency solutions for the future of digital transactions.',
  },
  cryptoPrices: {
    title: 'Live Cryptocurrency Prices',
    subtitle: 'Real-time market data',
    refreshesIn: 'Refreshes in',
  },
  securityFeatures: {
    title: "Military-Grade Security",
    subtitle: "Your assets and personal data are protected by enterprise-level security measures and real-time monitoring.",

    // Security Features tabs
    multiChannelAlerts: {
      title: "Multi-Channel Security Alerts",
      description: "Receive instant notifications about account activity through SMS, Email, and Telegram, ensuring you stay informed wherever you are."
    },
    twoFactor: {
      title: "Two-Factor For Everything",
      description: "Add an additional security layer to critical operations with our customizable 2FA options, protecting your most sensitive transactions."
    },
    encryption: {
      title: "Military-Grade Encryption",
      description: "Your data is protected with the same encryption standards used by military and financial institutions worldwide."
    },

    // Notification tab content
    realTimeAlerts: "Real-Time Security Alerts",
    email: {
      title: "Email",
      description: "Receive detailed security reports and alerts directly to your inbox"
    },
    sms: {
      title: "SMS",
      description: "Get instant text notifications for critical security events"
    },
    telegram: {
      title: "Telegram",
      description: "Connect our bot for secure and instant Telegram alerts"
    },
    recentAlerts: "Recent Security Alerts",
    loginAlert: "Login Alert",
    withdrawalActivity: "Withdrawal Activity",
    securityUpdate: "Security Update",
    loginMessage: "New login from Chrome • 2 min ago",
    withdrawMessage: "Withdrawal request confirmed • 1 hour ago",
    securityMessage: "Password change detected • 1 day ago",

    // Two-Factor tab content
    twoFactorAuth: "Two-Factor Authentication",
    loginProtection: {
      title: "Login Protection",
      description: "Secure your account access with an additional verification step every time you log in."
    },
    withdrawalVerification: {
      title: "Withdrawal Verification",
      description: "Additional security layer required for all withdrawal requests to prevent unauthorized transactions."
    },
    timeBasedOTP: "Time-based OTP",
    smsVerification: "SMS Verification",
    emailConfirmation: "Email Confirmation",
    twoFARequired: "2FA Required",
    googleAuthenticator: "Google Authenticator",
    authy: "Authy",

    // Encryption tab content
    militaryGradeDataProtection: "Military-Grade Data Protection",
    server: "Server",
    online: "Online",
    enterpriseSecurity: {
      title: "Enterprise Security Infrastructure",
      description: "Our system employs the same encryption standards used by financial institutions worldwide."
    },
    aes256: "AES-256",
    tls13: "TLS 1.3",
    sha512: "SHA-512",
    ecdh: "ECDH",
    advancedEncryption: "Advanced Encryption",
    secureTransport: "Secure Transport",
    hashingAlgorithm: "Hashing Algorithm",
    keyExchange: "Key Exchange",

    // Security badges
    soc2: "SOC 2",
    gdpr: "GDPR",
    pciDSS: "PCI DSS"
  },
  featuresSection: {
    title: "Why Choose Mercy",
    subtitle: "Our platform is designed with your needs in mind, offering a seamless and secure experience for all your cryptocurrency transactions.",
    features: {
      fastTransactions: {
        title: "Fast Transactions",
        description: "Experience lightning-fast transactions with our optimized blockchain integration. Transfer assets instantly, no matter where you are."
      },
      enhancedSecurity: {
        title: "Enhanced Security",
        description: "Your assets are protected by military-grade encryption and multi-layer security protocols. We implement the latest security standards to keep your funds safe."
      },
      support: {
        title: "24/7 Support",
        description: "Our dedicated team is available around the clock to assist you with any questions or concerns. Get help when you need it, no matter the time."
      }
    },
    cta: "Start Your Journey"
  },
  footer: {
    companyDescription: "Secure, fast and global cryptocurrency payments platform for businesses and individuals.",
    categories: {
      company: "Company",
      resources: "Resources",
      connect: "Connect"
    },
    links: {
      aboutUs: "About Us",
      contact: "Contact",
      careers: "Careers",
      blog: "Blog",
      faq: "FAQ",
      helpCenter: "Help Center",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service"
    },
    copyright: "© {year} Mercy. All rights reserved."
  }
};

export default en; 