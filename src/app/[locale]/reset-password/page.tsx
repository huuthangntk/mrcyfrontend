"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ResetPasswordModal from '@/components/ResetPasswordModal';
import { Loader2 } from 'lucide-react';

interface ResetPasswordPageProps {
  params: {
    locale: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [token, setToken] = useState<string | null>(null);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      // No token provided, redirect to forgot password
      router.push(`/${params.locale}/forgot-password`);
      return;
    }
    
    // Set the token from URL
    setToken(tokenParam);
    
    // Validate the token (in a real app, this would check with the server)
    const validateToken = async () => {
      try {
        // Simple validation for now (check token length)
        // In a real app, you'd call an API endpoint to validate the token
        setIsValidatingToken(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo, we assume the token is valid if it's not empty
        const isValid = tokenParam.length > 0;
        setIsTokenValid(isValid);
        
        if (isValid) {
          setIsModalOpen(true);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setIsTokenValid(false);
      } finally {
        setIsValidatingToken(false);
      }
    };
    
    validateToken();
  }, [searchParams, router, params.locale]);
  
  const handleSuccess = () => {
    // Redirect to login page after successful password reset
    router.push(`/${params.locale}/login`);
  };
  
  if (isValidatingToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Validating your reset link...</h2>
        <p className="text-muted-foreground mt-2">Please wait while we verify your request.</p>
      </div>
    );
  }
  
  if (!isTokenValid && !isValidatingToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive h-8 w-8">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </div>
        <h2 className="text-xl font-medium">Invalid or Expired Link</h2>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          The password reset link is invalid or has expired. Please request a new password reset link.
        </p>
        <button 
          className="mt-6 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          onClick={() => router.push(`/${params.locale}/forgot-password`)}
        >
          Request New Link
        </button>
      </div>
    );
  }
  
  return (
    <>
      {token && (
        <ResetPasswordModal 
          isOpen={isModalOpen} 
          onClose={() => router.push(`/${params.locale}/login`)} 
          onSuccess={handleSuccess}
          token={token}
        />
      )}
      
      {/* Fallback content in case modal doesn't show */}
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading password reset form...</h2>
      </div>
    </>
  );
} 