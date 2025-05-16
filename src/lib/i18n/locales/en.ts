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
    
    // Email Verification Modal
    verifyEmailTitle: 'Verify Your Email',
    verifyEmailDescription: 'We\'ve sent a 6-digit verification code to',
    enterCodeBelow: 'Enter the code below to verify your email',
    resendCodeIn: 'Resend code in',
    seconds: 'seconds',
    resendCode: 'Resend Code',
    sending: 'Sending...',
    verifyEmail: 'Verify Email',
    verifying: 'Verifying...',
    emailVerified: 'Your email has been successfully verified.',
    invalidVerificationCode: 'Invalid verification code. Please try again.',
    enterAllDigits: 'Please enter all 6 digits of the verification code',
    
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
    verify: 'Verify',
    
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