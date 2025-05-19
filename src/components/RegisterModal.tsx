"use client";

import React, { useState } from 'react';
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
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/i18n/TranslationProvider';
import { authService } from '@/services/authService';
import { EmailVerificationModal } from '@/components/EmailVerificationModal';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, userData: any) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Email verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredUserData, setRegisteredUserData] = useState<{
    username: string;
    email: string;
    fullName: string;
    password: string;
  } | null>(null);

  // Handle register form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        title: t('auth.error'),
        description: t('auth.passwordsDoNotMatch'),
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create the user data object
      const userData = {
        username,
        email,
        fullName,
        password
      };
      
      // Call the register API
      const response = await authService.register(userData);
      
      // Check response code to determine next action
      if (response.code === "REGISTRATION_SUCCESS") {
        // Store user data for verification resend if needed
        setRegisteredUserData(userData);
        
        // Show toast about successful registration
        toast({
          title: t('auth.registrationSuccess'),
          description: t('auth.checkEmail'),
        });
        
        // Show verification modal instead of redirecting to login
        setShowVerificationModal(true);
      }
    } catch (error) {
      // Error is already handled in the service
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle successful email verification
  const handleVerificationSuccess = () => {
    // Get the current email and user data before resetting
    const currentEmail = email;
    const currentUserData = registeredUserData;
    
    // Reset form fields
    setUsername('');
    setEmail('');
    setFullName('');
    setPassword('');
    setConfirmPassword('');
    
    // Close verification modal
    setShowVerificationModal(false);
    
    // Close register modal and proceed with verification success flow
    // Pass the email and user data to the parent component
    onSuccess(currentEmail, currentUserData);
  };
  
  // Handle verification modal close
  const handleVerificationModalClose = () => {
    setShowVerificationModal(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t('auth.registerTitle')}</DialogTitle>
            <DialogDescription>
              {t('auth.registerDescription')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('auth.fullName')}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('auth.fullName')}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">{t('auth.username')}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('auth.username')}
                required
              />
            </div>

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
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password')}
                  required
                  autoComplete="new-password"
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
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirmPassword')}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.registering')}
                  </>
                ) : (
                  t('common.register')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Email Verification Modal */}
      {showVerificationModal && (
        <EmailVerificationModal
          isOpen={showVerificationModal}
          onClose={handleVerificationModalClose}
          onSuccess={handleVerificationSuccess}
          email={email}
          userData={registeredUserData || undefined}
        />
      )}
    </>
  );
};

export default RegisterModal; 