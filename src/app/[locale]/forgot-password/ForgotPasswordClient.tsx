"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import Link from 'next/link';

interface ForgotPasswordClientProps {
  locale: string;
}

export default function ForgotPasswordClient({ locale }: ForgotPasswordClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleSuccess = () => {
    setIsSuccess(true);
    setIsModalOpen(false);
  };
  
  const handleClose = () => {
    router.push(`/${locale}/login`);
  };
  
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-green-50 p-4 rounded-full mb-4">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-medium">Check Your Email</h2>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          If your email address is registered in our system, you'll receive instructions on how to reset your password.
        </p>
        <p className="text-muted-foreground mt-4 text-center max-w-md">
          Please check your inbox and spam folder.
        </p>
        <div className="mt-6 flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => setIsModalOpen(true)}
          >
            Try Again
          </Button>
          <Link href={`/${locale}/login`}>
            <Button>
              Return to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <ForgotPasswordModal 
        isOpen={isModalOpen} 
        onClose={handleClose} 
        onSuccess={handleSuccess}
      />
      
      {/* Fallback content in case modal is closed without success */}
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-medium">Reset Your Password</h2>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <Button 
          className="mt-6"
          onClick={() => setIsModalOpen(true)}
        >
          Reset Password
        </Button>
      </div>
    </>
  );
} 