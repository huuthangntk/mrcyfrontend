"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '@/services/authService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/i18n/TranslationProvider';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  email: string;
  userData?: {
    username: string;
    email: string;
    fullName: string;
    password: string;
  };
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ 
  isOpen,
  onClose,
  onSuccess,
  email,
  userData
}) => {
  const { t } = useTranslation();
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Track last successful send time
  const [lastSendTime, setLastSendTime] = useState<number | null>(null);
  const RESEND_INTERVAL_MS = 120000; // 2 minutes (in milliseconds)
  
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      return;
    }
  }, [isOpen]);

  // Set up timer for resend code
  useEffect(() => {
    if (!isOpen) return;
    
    // Check if we have a last send time and it's less than 2 minutes ago
    if (lastSendTime) {
      const elapsedTime = Date.now() - lastSendTime;
      if (elapsedTime < RESEND_INTERVAL_MS) {
        // Calculate remaining time in seconds
        const remainingTime = Math.ceil((RESEND_INTERVAL_MS - elapsedTime) / 1000);
        setTimer(remainingTime);
        setCanResend(false);
      } else {
        setCanResend(true);
        setTimer(0);
      }
    }
    
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isOpen, lastSendTime]);
  
  // Set up refs with callback
  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };
  
  // Handle code input change
  const handleCodeChange = (index: number, value: string) => {
    // Allow only digits
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit if all digits are filled
    if (value && index === 5 && newCode.every(digit => digit)) {
      // Use setTimeout to ensure state is updated before submission
      setTimeout(() => {
        handleSubmit(new Event('submit') as unknown as React.FormEvent);
      }, 100);
    }
  };
  
  // Handle key press to navigate between inputs
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // Handle paste event to fill all fields
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted content contains only digits
    if (!/^\d+$/.test(pastedData)) return;
    
    const digits = pastedData.slice(0, 6).split('');
    const newCode = [...verificationCode];
    
    digits.forEach((digit, index) => {
      if (index < 6) newCode[index] = digit;
    });
    
    setVerificationCode(newCode);
    
    // Focus the next empty field or the last field
    const nextEmptyIndex = newCode.findIndex(c => !c);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
      
      // Auto-submit if all digits are filled after paste
      if (newCode.every(digit => digit)) {
        setTimeout(() => {
          handleSubmit(new Event('submit') as unknown as React.FormEvent);
        }, 100);
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      setError(t('auth.enterAllDigits'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.verifyEmailCode({
        email,
        code
      });
      
      toast({
        title: t('auth.verifyEmailTitle'),
        description: t('auth.emailVerified'),
        variant: "default"
      });
      
      // Call onSuccess to handle successful verification
      onSuccess();
    } catch (error: any) {
      console.error('Verification error:', error);
      console.error('Verification error details:', JSON.stringify(error, null, 2));
      
      // Extract error message
      let errorMessage = t('auth.invalidVerificationCode');
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Also show a toast for better visibility
      toast({
        title: t('auth.verification.failedTitle'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle code resend
  const handleResendCode = async () => {
    // Check if we need to enforce rate limiting
    if (lastSendTime) {
      const elapsedTime = Date.now() - lastSendTime;
      if (elapsedTime < RESEND_INTERVAL_MS) {
        const remainingSeconds = Math.ceil((RESEND_INTERVAL_MS - elapsedTime) / 1000);
        setError(`${t('auth.resendCodeIn')} ${remainingSeconds} ${t('auth.seconds')}`);
        return;
      }
    }
    
    if (!userData) {
      setError(t('auth.verification.failed'));
      return;
    }
    
    setResendLoading(true);
    setCanResend(false);
    setTimer(120); // Set timer to 2 minutes (120 seconds)
    setError(null);
    
    try {
      // Reuse the register function instead of a separate resend endpoint
      await authService.register(userData);
      
      // Update the last send time
      setLastSendTime(Date.now());
      
      toast({
        title: t('auth.resendCode'),
        description: `${t('auth.verifyEmailDescription')} ${email}`,
        variant: "default"
      });
      
      // Reset the code fields
      setVerificationCode(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (error: any) {
      console.error('Resend error:', error);
      console.error('Resend error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = t('auth.verification.failed');
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Also show a toast for better visibility
      toast({
        title: t('auth.verification.failedTitle'),
        description: errorMessage,
        variant: "destructive"
      });
      
      setCanResend(true);
      setTimer(0);
    } finally {
      setResendLoading(false);
    }
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    
    // Reset code fields when modal opens
    return () => {
      if (!isOpen) {
        setVerificationCode(['', '', '', '', '', '']);
        setError(null);
      }
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing via the close button, not by clicking outside
      if (!open) {
        // Reset state before closing
        setVerificationCode(['', '', '', '', '', '']);
        setError(null);
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Verify Your Email</DialogTitle>
          <DialogDescription className="text-center">
            <div className="flex flex-col items-center mt-2">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <p>We've sent a 6-digit verification code to <br /><span className="font-medium">{email}</span></p>
              <p className="text-sm mt-2">Enter the code below to verify your email</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Verification code inputs */}
          <div className="flex justify-center gap-2">
            {verificationCode.map((digit, index) => (
              <Input
                key={index}
                ref={setInputRef(index)}
                type="text"
                inputMode="numeric"
                className="w-12 h-14 text-center text-lg font-medium"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                required
              />
            ))}
          </div>
          
          {/* Resend code */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {canResend ? (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  onClick={handleResendCode}
                  type="button"
                  disabled={resendLoading || !userData}
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend Code"
                  )}
                </Button>
              ) : (
                <>
                  Resend code in <span className="font-medium">{timer}</span> seconds
                </>
              )}
            </p>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationModal; 