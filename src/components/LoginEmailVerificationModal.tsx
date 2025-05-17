"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '@/services/authService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/i18n/TranslationProvider';

interface LoginEmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  userId: number | undefined;
}

export const LoginEmailVerificationModal: React.FC<LoginEmailVerificationModalProps> = ({ 
  isOpen,
  onClose,
  onSuccess,
  userId
}) => {
  const { t } = useTranslation();
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setVerificationCode(['', '', '', '', '', '']);
      setError(null);
    }
  }, [isOpen]);

  // Set up refs with callback
  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };
  
  // Handle code input change
  const handleCodeChange = (index: number, value: string) => {
    // Allow only digits
    if (!/^\d*$/.test(value)) return;
    
    // Update code state with the new digit
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit if all digits are filled after entering the last digit
    if (value && index === 5) {
      const isComplete = newCode.every(digit => digit !== '');
      if (isComplete) {
        // Short timeout to ensure state is updated before form submission
        setTimeout(() => {
          formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }, 100);
      }
    }
  };
  
  // Handle key press to navigate between inputs
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      // If current field is empty, move to previous field
      if (verificationCode[index] === '') {
        if (index > 0) {
          // Move focus to previous input
          inputRefs.current[index - 1]?.focus();
          
          // Clear the previous field too
          const newCode = [...verificationCode];
          newCode[index - 1] = '';
          setVerificationCode(newCode);
        }
      }
    } 
    // Navigate left
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } 
    // Navigate right
    else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Handle Delete key
    else if (e.key === 'Delete') {
      // Clear current field
      const newCode = [...verificationCode];
      newCode[index] = '';
      setVerificationCode(newCode);
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
      if (newCode.every(digit => digit !== '')) {
        setTimeout(() => {
          formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
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
    
    if (!userId) {
      setError(t('auth.invalidUserId'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authService.verifyLoginEmail({
        userId,
        code
      });
      
      if (response && response.code === 'LOGIN_SUCCESS' && response.accessToken && response.refreshToken) {
        toast({
          title: t('auth.loginVerification.success'),
          description: t('auth.loginVerification.successMessage'),
          variant: "default"
        });
        
        // Call onSuccess to handle successful verification
        onSuccess(response);
      } else if (response && (response.accessToken && response.refreshToken)) {
        // If we have tokens but no specific code, assume success
        toast({
          title: t('auth.loginVerification.success'),
          description: t('auth.loginVerification.successMessage'),
          variant: "default"
        });
        
        onSuccess(response);
      } else {
        // If we don't have any indication of success, show an error
        throw new Error(t('auth.loginVerification.invalidResponse'));
      }
    } catch (error: any) {
      console.error('Login verification error:', error);
      
      // Extract error message and code
      let errorMessage = t('auth.loginVerification.invalidCode');
      let errorCode = null;
      
      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
        errorCode = error.response.data.code;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Set error message in UI
      setError(errorCode ? t(`auth.${errorCode}`) : errorMessage);
      
      // Also show a toast
      toast({
        title: t('auth.loginVerification.failedTitle'),
        description: errorCode ? t(`auth.${errorCode}`) : errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      // Short delay to ensure the modal is fully rendered
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
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
          <DialogTitle className="text-2xl text-center">{t('auth.loginVerification.title')}</DialogTitle>
          <DialogDescription className="text-center">
            <div className="flex flex-col items-center mt-2">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <p>{t('auth.loginVerification.description')}</p>
              <p className="text-sm mt-2">{t('auth.loginVerification.enterCode')}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('auth.error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 py-4">
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
          
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.verifying')}
                </>
              ) : (
                t('auth.verify')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginEmailVerificationModal;