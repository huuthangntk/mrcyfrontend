/**
 * Token management utilities for handling authentication tokens
 */

interface TokenData {
  accessToken: string;
  refreshToken: string;
}

interface DecodedToken {
  exp: number;
  userId: number;
  iat: number;
}

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Save authentication tokens to storage
 */
export const saveTokens = (tokens: TokenData): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
};

/**
 * Get stored tokens
 */
export const getTokens = (): TokenData | null => {
  if (typeof window === 'undefined') return null;
  
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  if (!accessToken || !refreshToken) return null;
  
  return { accessToken, refreshToken };
};

/**
 * Remove stored tokens (logout)
 */
export const removeTokens = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Decode JWT token
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  // Get current time in seconds
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Check if token is expired (with 30s buffer)
  return decoded.exp < currentTime + 30;
};

/**
 * Refresh the access token
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const tokens = getTokens();
    if (!tokens) return null;
    
    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: tokens.refreshToken,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    
    // Save the new access token
    saveTokens({
      accessToken: data.accessToken,
      refreshToken: tokens.refreshToken,
    });
    
    return data.accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    removeTokens(); // Clear tokens on failure
    return null;
  }
};

/**
 * Get auth header with bearer token
 */
export const getAuthHeader = async (): Promise<HeadersInit | null> => {
  const tokens = getTokens();
  if (!tokens) return null;
  
  let { accessToken } = tokens;
  
  // Check if token needs refresh
  if (isTokenExpired(accessToken)) {
    const newToken = await refreshAccessToken();
    if (!newToken) return null;
    accessToken = newToken;
  }
  
  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

/**
 * Fetch wrapper that handles authentication
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    const authHeader = await getAuthHeader();
    if (!authHeader) {
      throw new Error('Not authenticated');
    }
    
    const headers = {
      ...options.headers,
      ...authHeader,
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      // Try to parse error response
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If parsing fails, use status text
        throw new Error(response.statusText || `Request failed with status ${response.status}`);
      }
      
      // Create an error with the message from the response
      const error = new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
      // Add additional properties to the error for debugging
      (error as any).status = response.status;
      (error as any).statusText = response.statusText;
      (error as any).responseData = errorData;
      // Add code property if available
      if (errorData.code) {
        (error as any).code = errorData.code;
      }
      
      // Import toast dynamically to avoid circular dependencies
      const { toast } = await import("@/components/ui/use-toast");
      
      // Show toast notification using error code if available
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      
      throw error;
    }
    
    return response;
  } catch (error: any) {
    // If this is not a response error (e.g. network error or other exception),
    // show a toast notification
    if (!error.status) {
      // Import toast dynamically to avoid circular dependencies
      const { toast } = await import("@/components/ui/use-toast");
      
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
    
    throw error;
  }
};

/**
 * Logout user by removing tokens and calling logout API
 */
export const logoutUser = async (): Promise<void> => {
  try {
    const tokens = getTokens();
    if (tokens) {
      // Call logout API to invalidate the refresh token
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: tokens.refreshToken,
        }),
      });
    }
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // Always remove tokens regardless of API call success
    removeTokens();
  }
}; 