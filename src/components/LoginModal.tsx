"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';
import TwoFactorAuthModal from './TwoFactorAuthModal';
import LoginEmailVerificationModal from './LoginEmailVerificationModal';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/i18n/TranslationProvider';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onForgotPassword?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onForgotPassword
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  
  // Verification modals
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [userId, setUserId] = useState<number | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login({
        email,
        password
      });
      
      // If we got a response with a code, handle it appropriately
      if (response) {
        // Store userId from response if available
        if (response.userId) {
          setUserId(response.userId);
        }
        
        // Check if login is directly successful
        if (response.code === 'LOGIN_SUCCESS' || (response.accessToken && response.refreshToken)) {
          // Already successful, no need for additional verification
          handleVerificationSuccess(response);
        } 
        // Only show verification modals if specifically required
        else if (response.code === 'REQUIRE_2FA_CODE') {
          setShowTwoFactorModal(true);
        } else if (response.code === 'EMAIL_VERIFICATION_REQUIRED') {
          setShowEmailVerificationModal(true);
        } else {
          // For any other code or unknown situation, try to handle as success if we have tokens
          handleVerificationSuccess(response);
        }
      }
    } catch (error) {
      // Error handling is already done in the authService
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // First close this modal
    onClose();
    
    // Open the forgot password modal
    setTimeout(() => {
      if (onForgotPassword) {
        onForgotPassword();
      } else {
        setShowForgotPasswordModal(true);
      }
    }, 100); // Small delay to ensure modal close has completed
  };
  
  const handleForgotPasswordSuccess = () => {
    setShowForgotPasswordModal(false);
    // Any additional actions after password reset request
  };
  
  const handleVerificationSuccess = (response: any) => {
    // Close all verification modals
    setShowTwoFactorModal(false);
    setShowEmailVerificationModal(false);
    
    // Store tokens in localStorage or sessionStorage regardless of response code
    if (response && (response.accessToken && response.refreshToken)) {
      if (rememberMe) {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('rememberMe', 'true');
      } else {
        sessionStorage.setItem('accessToken', response.accessToken);
        sessionStorage.setItem('refreshToken', response.refreshToken);
      }
      
      // Handle successful login - never show any other modal after verification
      onSuccess();
    } else {
      // Handle error case when tokens are missing
      toast({
        title: t('auth.error'),
        description: t('auth.loginFailed'),
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t('auth.loginTitle')}</DialogTitle>
            <DialogDescription>
              {t('auth.loginDescription')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.email')}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={handleForgotPassword}
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password')}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                {t('auth.rememberMe')}
              </Label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.loggingIn')}
                  </>
                ) : (
                  t('common.login')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onSuccess={handleForgotPasswordSuccess}
      />
      
      {/* Two Factor Authentication Modal */}
      <TwoFactorAuthModal 
        isOpen={showTwoFactorModal}
        onClose={() => setShowTwoFactorModal(false)}
        onSuccess={handleVerificationSuccess}
        email={email}
        password={password}
        userId={userId}
      />
      
      {/* Email Verification Modal */}
      <LoginEmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        onSuccess={handleVerificationSuccess}
        email={email}
        password={password}
        userId={userId}
      />
    </>
  );
};

export default LoginModal; 