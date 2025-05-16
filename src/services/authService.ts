import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

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
  }
  
  // Show toast notification with error message
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive"
  });
  
  return errorMessage;
};

// Auth service
export const authService = {
  // Register a new user
  async register(userData: {
    username: string;
    email: string;
    fullName: string;
    password: string;
  }) {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return null; // Return null instead of throwing
    }
  },
  
  // Verify email with token (from email link)
  async verifyEmailToken(token: string) {
    try {
      const response = await api.get(`/api/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
  
  // Verify email with code
  async verifyEmailCode(data: { email: string; code: string }) {
    try {
      const response = await api.post('/api/auth/verify-code', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
  
  // Login user
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await api.post('/api/auth/login', credentials);
      
      // Store tokens in localStorage
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
  
  // Refresh token
  async refreshToken(refreshToken: string) {
    try {
      const response = await axios.post(`${API_URL}/api/auth/refresh-token`, { refreshToken });
      return response.data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
  
  // Logout user
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return;
      
      await api.post('/api/auth/logout', { refreshToken });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove tokens even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return false;
    }
  },
  
  // Request password reset
  async forgotPassword(email: string) {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
  
  // Reset password with token
  async resetPassword(data: { token: string; newPassword: string }) {
    try {
      const response = await api.post('/api/auth/reset-password', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
  
  // Resend verification email
  async resendVerificationEmail(email: string) {
    try {
      // The API doesn't have a specific endpoint for resending verification
      // so we'll reuse the registration endpoint with a "resend" flag
      const response = await api.post('/api/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
  
  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/api/users/me');
      return response.data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
  
  // Verify 2FA code during login
  async verify2FA(data: { userId: number; code: string }) {
    try {
      const response = await api.post('/api/2fa/verify', data);
      
      // If verification is successful, update the tokens
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
};

export default authService; 