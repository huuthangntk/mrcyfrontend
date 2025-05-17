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
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');
        
        const response = await authService.refreshToken(refreshToken);
        localStorage.setItem('accessToken', response.accessToken);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out the user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
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

interface VerifyLoginEmailParams {
  userId: number;
  code: string;
}

interface LoginResponse {
  message?: string;
  code?: string;
  userId?: number;
  accessToken?: string;
  refreshToken?: string;
  username?: string;
  fullName?: string;
}

// Storage key constants
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

class AuthService {
  private baseUrl = API_BASE_URL;

  async login(params: LoginParams): Promise<LoginResponse> {
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

  async verifyLoginEmail(params: VerifyLoginEmailParams): Promise<LoginResponse> {
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
      console.error('Verification error:', error);
      toast({
        title: 'Verification Error',
        description: error.message || 'Failed to verify code. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }

  /**
   * Stores authentication tokens either in localStorage or sessionStorage
   * @param accessToken Access token
   * @param refreshToken Refresh token
   * @param rememberMe Whether to store in localStorage (true) or sessionStorage (false)
   */
  setTokens(accessToken: string, refreshToken: string, rememberMe: boolean): void {
    try {
      // Clear existing tokens first
      this.logout();
      
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(ACCESS_TOKEN_KEY, accessToken);
      storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      
      // Dispatch a storage event to notify other tabs/components
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  /**
   * Removes all authentication tokens from both localStorage and sessionStorage
   */
  logout(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      
      // Dispatch a storage event to notify other tabs/components
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  /**
   * Checks if the user is authenticated by verifying token existence
   * @returns boolean indicating if the user is authenticated
   */
  isAuthenticated(): boolean {
    try {
      if (typeof window === 'undefined') {
        return false; // Not authenticated in server-side context
      }
      
      return !!(
        localStorage.getItem(ACCESS_TOKEN_KEY) || 
        sessionStorage.getItem(ACCESS_TOKEN_KEY)
      );
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  /**
   * Gets the current access token from storage
   * @returns The access token or null if not found
   */
  getToken(): string | null {
    try {
      if (typeof window === 'undefined') {
        return null;
      }
      
      return localStorage.getItem(ACCESS_TOKEN_KEY) || 
             sessionStorage.getItem(ACCESS_TOKEN_KEY) || 
             null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }
}

export const authService = new AuthService(); 