"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getTokens, 
  saveTokens, 
  removeTokens, 
  logoutUser,
  isTokenExpired,
  refreshAccessToken
} from '@/lib/auth/token';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean }>;
  verify2FA: (userId: number, code: string) => Promise<boolean>;
  register: (userData: RegisterUserData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterUserData {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

interface LoginResponse {
  userId: number;
  username: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
  requires2FA?: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const tokens = getTokens();
        if (!tokens) {
          setIsLoading(false);
          return;
        }

        // If token is expired, try to refresh
        if (isTokenExpired(tokens.accessToken)) {
          const newToken = await refreshAccessToken();
          if (!newToken) {
            setIsLoading(false);
            return;
          }
        }

        // Fetch user data
        await refreshUser();
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Refresh user data from API
  const refreshUser = async () => {
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${getTokens()?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json() as LoginResponse;

      // Check if 2FA is required
      if (data.requires2FA) {
        return { success: true, requires2FA: true };
      }

      // Save tokens
      saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      // Set user data
      setUser({
        id: data.userId,
        username: data.username,
        fullName: data.fullName,
        email, // Email is not returned in the response
        isVerified: true, // Assumed to be verified since login succeeded
      });

      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  };

  // Verify 2FA code
  const verify2FA = async (userId: number, code: string) => {
    try {
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, code }),
      });

      if (!response.ok) {
        throw new Error('2FA verification failed');
      }

      // After 2FA verification, we need to fetch tokens again
      // In a real implementation, the API would return tokens directly
      // For now, we'll just simulate successful 2FA
      await refreshUser();
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('2FA verification error:', error);
      return false;
    }
  };

  // Register function
  const register = async (userData: RegisterUserData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsAuthenticated(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    verify2FA,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 