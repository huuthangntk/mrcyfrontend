"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/i18n/TranslationProvider';
import { authService } from '@/services/authService';
import ForgotPasswordModal from './ForgotPasswordModal';
import LoginEmailVerificationModal from './LoginEmailVerificationModal';
import TwoFactorAuthModal from './TwoFactorAuthModal';

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
  const router = useRouter();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  
  // User ID for verification
  const [userId, setUserId] = useState<number | undefined>(undefined);

  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Initial login request
      const response = await authService.login({
        email,
        password
      });
      
      // Store the userId for verification steps
      if (response.userId) {
        setUserId(response.userId);
      }
      
      // Check response code to determine next step
      if (response.code === 'REQUIRE_2FA_CODE') {
        // 2FA is required
        setShowTwoFactorModal(true);
      } 
      else if (response.code === 'EMAIL_VERIFICATION_REQUIRED') {
        // Email verification is required
        setShowEmailVerificationModal(true);
      } 
      else if (response.code === 'LOGIN_SUCCESS' && response.accessToken && response.refreshToken) {
        // Direct login success (rare case, normally verification is needed)
        handleLoginSuccess(response);
      }
      else {
        // Unexpected response
        toast({
          title: t('auth.error'),
          description: t('auth.unexpectedResponse'),
          variant: 'destructive'
        });
      }
    } catch (error) {
      // Error is already handled in the authService
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful login after all verification
  const handleLoginSuccess = (data: any) => {
    // Store the tokens
    if (data.accessToken && data.refreshToken) {
      authService.storeTokens(data.accessToken, data.refreshToken, rememberMe);
    }
    
    // Close all modals
    setShowTwoFactorModal(false);
    setShowEmailVerificationModal(false);
    
    // Show success message
    toast({
      title: t('auth.loginSuccess'),
      description: t('auth.welcomeBack', { name: data.fullName || data.username || email }),
    });
    
    // Fire success callback
    onSuccess();
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  // Handle forgot password
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Close login modal
    onClose();
    
    // Open forgot password modal
    setTimeout(() => {
      if (onForgotPassword) {
        onForgotPassword();
      } else {
        setShowForgotPasswordModal(true);
      }
    }, 100);
  };

  return (
    <>
      {/* Main Login Modal */}
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
      
      {/* Verification Modals */}
      <LoginEmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        onSuccess={handleLoginSuccess}
        userId={userId}
      />
      
      <TwoFactorAuthModal 
        isOpen={showTwoFactorModal}
        onClose={() => setShowTwoFactorModal(false)}
        onSuccess={handleLoginSuccess}
        userId={userId}
      />
      
      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onSuccess={() => setShowForgotPasswordModal(false)}
      />
    </>
  );
};

export default LoginModal; 