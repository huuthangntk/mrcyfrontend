"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getTokens, isTokenExpired, refreshAccessToken } from '@/lib/auth/token';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tokens = getTokens();
        
        // If no tokens are found, redirect to login
        if (!tokens) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
        
        // Check if access token is expired
        if (isTokenExpired(tokens.accessToken)) {
          // Try to refresh the token
          const newToken = await refreshAccessToken();
          
          // If refresh fails, redirect to login
          if (!newToken) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
          }
        }
        
        // User is authenticated
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication check failed:', error);
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [pathname, router]);
  
  // Show loading indicator while checking authentication
  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }
  
  // Show children only if authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute; 