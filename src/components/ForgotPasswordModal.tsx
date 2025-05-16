"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Mail } from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/use-toast';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      
      setIsSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "If the email is registered, you will receive a password reset link.",
        variant: "default"
      });
      
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      // Don't show specific error messages for security reasons
      // Even if the email doesn't exist, we don't want to reveal that
      toast({
        title: "Reset link sent",
        description: "If the email is registered, you will receive a password reset link.",
        variant: "default"
      });
      setIsSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[400px] p-3"
        onInteractOutside={isSubmitted ? (e) => e.preventDefault() : undefined}
      >
        <div className="flex justify-center mb-1">
          <div className="bg-primary/10 p-2 rounded-full">
            <Mail className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        <DialogHeader className="space-y-0 pb-1">
          <DialogTitle className="text-base text-center font-semibold">
            {!isSubmitted ? "Reset Your Password" : "Email Sent"}
          </DialogTitle>
          <p className="text-xs text-center text-muted-foreground">
            {!isSubmitted 
              ? "We'll send you a link to reset your password"
              : "Check your inbox for the reset link"}
          </p>
        </DialogHeader>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-2 pt-1">
            <div className="space-y-0">
              <Label htmlFor="email" className="text-xs">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={isLoading}
                className="h-8 text-sm"
              />
            </div>

            <DialogFooter className="pt-1">
              <Button type="submit" className="w-full h-8 text-sm" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-2 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Redirecting you...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal; 