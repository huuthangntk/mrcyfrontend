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
import { KeyRound, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId
}) => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Set up timer for code expiration
  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(30);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

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
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const code = verificationCode.join('');

    if (code.length !== 6) {
      setError('Please enter all 6 digits of the verification code');
      return;
    }

    setIsLoading(true);

    try {
      await authService.verify2FA({
        userId,
        code
      });

      toast({
        title: "Verification successful",
        description: "Two-factor authentication verified successfully.",
        variant: "default"
      });

      // Call onSuccess to handle successful verification
      onSuccess();
    } catch (error: any) {
      console.error('2FA verification error:', error);
      setError(error.message || 'Invalid authentication code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing via the close button, not by clicking outside
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Two-Factor Authentication</DialogTitle>
          <DialogDescription className="text-center">
            <div className="flex flex-col items-center mt-2">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
              <p>Enter the 6-digit code from your authenticator app</p>

              <div className="mt-2 flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${timeLeft > 0 ? 'bg-green-500 animate-pulse' : 'bg-destructive'}`}></div>
                <p className="text-sm">
                  {timeLeft > 0 ? (
                    <>Code refreshes in <span className="font-medium">{timeLeft}</span>s</>
                  ) : (
                    <>Please get a new code from your app</>
                  )}
                </p>
              </div>
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

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorModal; 