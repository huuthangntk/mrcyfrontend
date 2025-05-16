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
import { Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/i18n/TranslationProvider';

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
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password validation criteria
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasMinimumLength = password.length >= 8;

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (hasLowerCase) strength += 20;
    if (hasUpperCase) strength += 20;
    if (hasNumber) strength += 20;
    if (hasSpecialChar) strength += 20;
    if (hasMinimumLength) strength += 20;

    setPasswordStrength(strength);
  }, [password, hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, hasMinimumLength]);

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
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
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
      const userData = {
        username,
        email,
        fullName,
        password
      };
  
      const response = await authService.register(userData);
      
      // Only proceed if registration was successful (response is not null)
      if (response) {
        // Pass the email and userData to the success handler for verification and resending
        onSuccess(email, userData);
        
        // Clear the form
        setUsername('');
        setEmail('');
        setFullName('');
        setPassword('');
        setConfirmPassword('');
        setAcceptTerms(false);
      }
      // If response is null, registration failed but was handled by the service
    } catch (error: any) {
      // This will only execute if authService.register throws an error
      console.error('Registration error:', error);
      // Error handling logic
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create an Account</DialogTitle>
          <DialogDescription>
            Fill in your details to create your account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              name='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
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
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}

            {/* Password strength meter */}
            {password.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Password Strength: </span>
                  <span className={`text-sm font-medium ${passwordStrength < 40 ? 'text-destructive' :
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
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className={`pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              required
              className={errors.terms ? 'border-destructive' : ''}
            />
            <Label
              htmlFor="terms"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              I accept the{" "}
              <Link
                href="/terms"
                className="text-primary hover:underline"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                Terms and Conditions
              </Link>
            </Label>
          </div>
          {errors.terms && (
            <p className="text-sm text-destructive mt-1">{errors.terms}</p>
          )}

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal; 