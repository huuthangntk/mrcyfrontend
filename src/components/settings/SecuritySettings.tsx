"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Check, X, Shield, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { authenticatedFetch } from '@/lib/auth/token';

export const SecuritySettings = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  
  // Password validation criteria
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const hasMinimumLength = newPassword.length >= 8;
  
  // Calculate password strength whenever password changes
  React.useEffect(() => {
    let strength = 0;
    if (hasLowerCase) strength += 20;
    if (hasUpperCase) strength += 20;
    if (hasNumber) strength += 20;
    if (hasSpecialChar) strength += 20;
    if (hasMinimumLength) strength += 20;
    setPasswordStrength(strength);
  }, [newPassword, hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, hasMinimumLength]);
  
  // Fetch 2FA status on mount
  React.useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const response = await authenticatedFetch('/api/2fa/status');
        if (response.ok) {
          const data = await response.json();
          setIs2FAEnabled(data.isEnabled);
        }
      } catch (err) {
        console.error('Failed to fetch 2FA status:', err);
      }
    };
    
    fetch2FAStatus();
  }, []);
  
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
  
  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordStrength < 60) {
      setError('Please choose a stronger password');
      return;
    }
    
    setIsPasswordLoading(true);
    
    try {
      const response = await authenticatedFetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to change password');
      }
      
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsPasswordLoading(false);
    }
  };
  
  // Handle 2FA toggle
  const handle2FAToggle = async () => {
    setError(null);
    setSuccess(null);
    setIsTwoFactorLoading(true);
    
    try {
      if (is2FAEnabled) {
        // Disable 2FA
        const response = await authenticatedFetch('/api/2fa/disable', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to disable 2FA');
        }
        
        setIs2FAEnabled(false);
        setSuccess('Two-factor authentication disabled');
      } else {
        // Enable 2FA
        const response = await authenticatedFetch('/api/2fa/enable', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to enable 2FA');
        }
        
        const data = await response.json();
        setQrCodeUrl(data.qrCodeUrl);
        setSecretKey(data.secret);
        setIs2FAEnabled(true);
        setSuccess('Two-factor authentication enabled');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsTwoFactorLoading(false);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handlePasswordChange}>
          <CardContent className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isPasswordLoading}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isPasswordLoading}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isPasswordLoading}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isPasswordLoading}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
              
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
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
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
                    <div className="flex items-center text-sm col-span-2">
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
            
            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPasswordLoading}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isPasswordLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-destructive">Passwords do not match</p>
              )}
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={isPasswordLoading}>
              {isPasswordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Two-Factor Authentication Section */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with two-factor authentication
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  {is2FAEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            
            <Switch
              checked={is2FAEnabled}
              onCheckedChange={handle2FAToggle}
              disabled={isTwoFactorLoading}
            />
          </div>
          
          {is2FAEnabled && qrCodeUrl && (
            <>
              <Separator />
              
              <div className="space-y-4 pt-2">
                <h3 className="font-medium">Setup Instructions</h3>
                <p className="text-sm">
                  Scan the QR code below with your authenticator app (like Google Authenticator, Authy, or 1Password).
                </p>
                
                <div className="flex justify-center p-4">
                  {/* QR Code image would be displayed here */}
                  <div className="border p-4 inline-block">
                    <img 
                      src={qrCodeUrl} 
                      alt="2FA QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>
                
                {secretKey && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Or enter this code manually:</p>
                    <code className="bg-muted p-2 block text-center rounded text-sm">{secretKey}</code>
                  </div>
                )}
                
                <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Important: Save your recovery codes in a safe place. You'll need them if you lose access to your authenticator app.
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Error and Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SecuritySettings; 