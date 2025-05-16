"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

interface VerifyEmailPageProps {
  params: {
    locale: string;
  };
}

export default function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setIsVerifying(false);
      setError('No verification token found. Please check your email link.');
      return;
    }
    
    const verifyEmail = async () => {
      try {
        setIsVerifying(true);
        
        // In a real app, call the API endpoint
        // const response = await fetch(`/api/auth/verify-email/${token}`, {
        //   method: 'GET',
        // });
        
        // if (!response.ok) {
        //   throw new Error('Verification failed');
        // }
        
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, we'll just assume success if token exists
        setIsSuccess(true);
      } catch (error) {
        console.error('Email verification error:', error);
        setError('Email verification failed. The link may be invalid or expired.');
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyEmail();
  }, [searchParams]);
  
  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Verifying Your Email</h2>
        <p className="text-muted-foreground mt-2">Please wait while we confirm your email address.</p>
      </div>
    );
  }
  
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-green-50 p-4 rounded-full mb-4">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Email Verified Successfully!</h2>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          Your email has been verified. You can now log in to your account.
        </p>
        <Link href={`/${params.locale}/login`} className="mt-6">
          <Button size="lg">
            Login to Your Account
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-destructive/10 p-4 rounded-full mb-4">
        <XCircle className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold">Verification Failed</h2>
      <p className="text-muted-foreground mt-2 text-center max-w-md">
        {error || 'An error occurred during verification. Please try again.'}
      </p>
      <div className="mt-6 flex gap-4">
        <Link href={`/${params.locale}/login`}>
          <Button variant="outline">
            Return to Login
          </Button>
        </Link>
        <Button>
          Resend Verification Email
        </Button>
      </div>
    </div>
  );
} 