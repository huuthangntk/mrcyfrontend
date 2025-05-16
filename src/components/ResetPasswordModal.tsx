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
import { Eye, EyeOff, Check, X, Loader2, KeyRound } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/use-toast';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  token
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password validation criteria
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const hasMinimumLength = newPassword.length >= 8;

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (hasLowerCase) strength += 20;
    if (hasUpperCase) strength += 20;
    if (hasNumber) strength += 20;
    if (hasSpecialChar) strength += 20;
    if (hasMinimumLength) strength += 20;

    setPasswordStrength(strength);
  }, [newPassword, hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, hasMinimumLength]);

  // Get strength color
  const getStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-destructive';
    if (passwordStrength < 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  // Get strength text
  const getStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 80) return 'Moderate';
    return 'Strong';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordStrength < 60) {
      newErrors.password = 'Password is too weak';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({
        token,
        newPassword
      });
      
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in with your new password.",
        variant: "default"
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Password reset failed",
        description: error.message || "An error occurred while resetting your password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Set New Password</DialogTitle>
          <DialogDescription className="text-center">
            <div className="flex flex-col items-center mt-2">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
              {!isSuccess ? (
                <p>Create a new secure password for your account</p>
              ) : (
                <p className="text-green-600">
                  Your password has been reset successfully!
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}

              {/* Password strength meter */}
              {newPassword.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Password Strength: </span>
                    <span className={`text-sm font-medium ${
                      passwordStrength < 40 ? 'text-destructive' :
                      passwordStrength < 80 ? 'text-orange-500' : 'text-green-500'
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <Progress value={passwordStrength} className={`h-2 ${getStrengthColor()}`} />

                  <div className="grid grid-cols-1 gap-1 mt-2">
                    <div className="flex items-center text-sm">
                      {hasMinimumLength ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mr-2 text-destructive" />
                      )}
                      At least 8 characters
                    </div>
                    <div className="flex items-center text-sm">
                      {hasLowerCase ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mr-2 text-destructive" />
                      )}
                      One lowercase letter
                    </div>
                    <div className="flex items-center text-sm">
                      {hasUpperCase ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mr-2 text-destructive" />
                      )}
                      One uppercase letter
                    </div>
                    <div className="flex items-center text-sm">
                      {hasNumber ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mr-2 text-destructive" />
                      )}
                      One number
                    </div>
                    <div className="flex items-center text-sm">
                      {hasSpecialChar ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mr-2 text-destructive" />
                      )}
                      One special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className={`pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Redirecting to login...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordModal; 