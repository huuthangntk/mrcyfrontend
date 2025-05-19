import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/lib/config';

// Enhanced error interface
interface ApiError extends Error {
  code?: string;
  response?: any;
  status?: number;
}

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');
        
        const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
          refreshToken
        });
        
        const { accessToken } = response.data;
        
        // Store the new access token
        localStorage.setItem('accessToken', accessToken);
        
        // Update the Authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Retry the original request with the new token
        return axios(originalRequest);
      } catch (refreshError: any) {
        // Handle specific refresh token errors based on error codes
        if (refreshError.response?.data) {
          const { code, message } = refreshError.response.data;
          
          // Handle specific error codes
          switch(code) {
            case 'MISSING_REFRESH_TOKEN':
            case 'INVALID_REFRESH_TOKEN':
            case 'EXPIRED_REFRESH_TOKEN':
              toast({
                title: 'Session Expired',
                description: 'Your session has expired. Please log in again.',
                variant: 'destructive'
              });
              break;
            default:
              toast({
                title: 'Authentication Error',
                description: message || 'Failed to refresh authentication. Please log in again.',
                variant: 'destructive'
              });
          }
        }
        
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        
        // Trigger events for cross-tab communication
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('authStateChange'));
        
        // Redirect to login page
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper to handle API errors consistently
const handleApiError = (error: any): string => {
  console.error('API Error:', error);
  
  let errorMessage = 'An unexpected error occurred';
  let errorCode = null;
  
  // Extract error message and code from various error formats
  if (error.response?.data) {
    errorMessage = error.response.data.message || error.response.data.error || errorMessage;
    errorCode = error.response.data.code;
  } else if (error instanceof Error) {
    errorMessage = error.message || errorMessage;
    // For errors thrown manually that might have a code
    if ((error as ApiError).code) {
      errorCode = (error as ApiError).code;
    }
  }
  
  // Show toast notification with error message
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive"
  });
  
  return errorMessage;
};

// Types
interface LoginParams {
  email: string;
  password: string;
}

interface VerifyEmailParams {
  userId: number;
  code: string;
}

interface Verify2FAParams {
  userId: number;
  code: string;
}

interface AuthResponse {
  message?: string;
  code?: string;
  userId?: number;
  username?: string;
  fullName?: string;
  accessToken?: string;
  refreshToken?: string;
}

interface RegisterParams {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

class AuthService {
  private baseUrl = API_BASE_URL;

  // Initial login request
  async login(params: LoginParams): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login Error',
        description: error.message || 'Failed to login. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }

  // Verify email code
  async verifyLoginEmail(params: VerifyEmailParams): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify-login-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      return data;
    } catch (error: any) {
      console.error('Email verification error:', error);
      toast({
        title: 'Verification Error',
        description: error.message || 'Failed to verify email code. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }

  // Verify 2FA code
  async verify2FA(params: Verify2FAParams): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify-login-app`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      return data;
    } catch (error: any) {
      console.error('2FA verification error:', error);
      toast({
        title: '2FA Verification Error',
        description: error.message || 'Failed to verify 2FA code. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }

  // Store authentication tokens
  storeTokens(accessToken: string, refreshToken: string, rememberMe: boolean = true) {
    if (rememberMe) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
    }
    
    // Trigger events for cross-tab communication and in-app state updates
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authStateChange'));
  }

  // Get stored tokens
  getTokens() {
    return {
      accessToken: localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
    };
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Token refresh failed') as ApiError;
        error.code = data.code;
        error.status = response.status;
        throw error;
      }

      return {
        accessToken: data.accessToken
      };
    } catch (error: any) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    
    // Trigger storage event for cross-tab communication
    window.dispatchEvent(new Event('storage'));
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!(
      localStorage.getItem('accessToken') || 
      sessionStorage.getItem('accessToken')
    );
  }

  // Register a new user
  async register(params: RegisterParams): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Error',
        description: error.message || 'Failed to register. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }

  // Verify email with code
  async verifyEmailCode(params: { email: string; code: string }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed');
      }

      return data;
    } catch (error: any) {
      console.error('Email verification error:', error);
      toast({
        title: 'Verification Error',
        description: error.message || 'Failed to verify email code. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }
}

export const authService = new AuthService();

export default authService; 