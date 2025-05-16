"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/i18n/TranslationProvider';

interface VerifyEmailTokenPageProps {
  params: {
    locale: string;
    token: string;
  };
}

export default function VerifyEmailTokenPage({ params }: VerifyEmailTokenPageProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale, token } = params;
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setIsVerifying(false);
        setError(t('verification.noToken'));
        return;
      }
      
      try {
        setIsVerifying(true);
        
        // Call the API to verify the email token
        await authService.verifyEmailToken(token);
        
        setIsSuccess(true);
        toast({
          title: t('verification.success'),
          description: t('verification.successDescription'),
          variant: 'default',
        });
      } catch (error: any) {
        console.error('Email verification error:', error);
        const errorCode = error.response?.data?.code;
        
        // Set the error message for display
        setError(errorCode ? t(`auth.${errorCode}`) : (error.message || t('verification.failed')));
        
        // Show toast notification
        toast({
          title: t('verification.failedTitle'),
          description: errorCode ? t(`auth.${errorCode}`) : (error.message || t('verification.failed')),
          variant: 'destructive',
        });
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyEmail();
  }, [token, t]);
  
  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">{t('verification.verifying')}</h2>
        <p className="text-muted-foreground mt-2">{t('verification.pleaseWait')}</p>
      </div>
    );
  }
  
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-green-50 p-4 rounded-full mb-4">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">{t('verification.success')}</h2>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          {t('verification.successDescription')}
        </p>
        <Link href={`/${locale}/login`} className="mt-6">
          <Button size="lg">
            {t('verification.loginButton')}
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
      <h2 className="text-2xl font-bold">{t('verification.failedTitle')}</h2>
      <p className="text-muted-foreground mt-2 text-center max-w-md">
        {error || t('verification.failed')}
      </p>
      <div className="mt-6 flex gap-4">
        <Link href={`/${locale}/login`}>
          <Button variant="outline">
            {t('verification.returnToLogin')}
          </Button>
        </Link>
        <Link href={`/${locale}/resend-verification`}>
          <Button>
            {t('verification.resendButton')}
          </Button>
        </Link>
      </div>
    </div>
  );
} 