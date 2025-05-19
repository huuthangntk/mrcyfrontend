"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, AlertCircle, EyeOff, Eye, Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { authenticatedFetch } from '@/lib/auth/token';
import { API_BASE_URL } from '@/lib/config';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n/TranslationProvider';
import { motion, AnimatePresence } from 'framer-motion';

// This would typically come from an API call
const TwoFactorAuthService = {
  async getStatus(): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!accessToken) return false;
      
      let response = await fetch(`${API_BASE_URL}/api/2fa/status`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        if (!refreshToken) return false;
        
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        
        if (!refreshResponse.ok) return false;
        
        const refreshData = await refreshResponse.json();
        const newAccessToken = refreshData.accessToken;
        
        localStorage.setItem('accessToken', newAccessToken);
        
        response = await fetch(`${API_BASE_URL}/api/2fa/status`, {
          headers: {
            'Authorization': `Bearer ${newAccessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      if (!response.ok) return false;
      const data = await response.json();
      return data.isEnabled || false;
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
      return false;
    }
  },
  
  async enable(): Promise<{ secret: string }> {
    try {
      const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Not authenticated');
      
      let response = await fetch(`${API_BASE_URL}/api/2fa/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('Refresh token is missing');
        
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        
        if (!refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          throw new Error(refreshData.message || 'Failed to refresh token');
        }
        
        const refreshData = await refreshResponse.json();
        const newAccessToken = refreshData.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        
        response = await fetch(`${API_BASE_URL}/api/2fa/enable`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${newAccessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to enable 2FA');
      }
      
      const data = await response.json();
      
      if (!data.secret) {
        console.error('Missing secret in API response:', data);
        throw new Error('Backend did not return a valid secret key');
      }
      
      return { secret: data.secret };
    } catch (error) {
      console.error('Enable 2FA error:', error);
      throw error;
    }
  },
  
  async verify(code: string, userId: number): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!accessToken) return false;
      
      let response = await fetch(`${API_BASE_URL}/api/2fa/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, code })
      });
      
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        if (!refreshToken) return false;
        
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        
        if (!refreshResponse.ok) return false;
        
        const refreshData = await refreshResponse.json();
        const newAccessToken = refreshData.accessToken;
        
        localStorage.setItem('accessToken', newAccessToken);
        
        response = await fetch(`${API_BASE_URL}/api/2fa/verify`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${newAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId, code })
        });
      }
      
      return response.ok;
    } catch (error) {
      console.error('Verify 2FA error:', error);
      return false;
    }
  },
  
  async disable(code: string): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!accessToken) return false;
      
      let response = await fetch(`${API_BASE_URL}/api/2fa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        if (!refreshToken) return false;
        
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        
        if (!refreshResponse.ok) return false;
        
        const refreshData = await refreshResponse.json();
        const newAccessToken = refreshData.accessToken;
        
        localStorage.setItem('accessToken', newAccessToken);
        
        response = await fetch(`${API_BASE_URL}/api/2fa/disable`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${newAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code })
        });
      }
      
      return response.ok;
    } catch (error) {
      console.error('Disable 2FA error:', error);
      return false;
    }
  }
};

// Password service with proper response handling
const PasswordService = {
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string; code?: string }> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        return {
          success: false,
          message: 'Not authenticated',
          code: 'NOT_AUTHENTICATED'
        };
      }

      let response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          return {
            success: false,
            message: 'Refresh token is missing',
            code: 'MISSING_REFRESH_TOKEN'
          };
        }
        
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        
        if (!refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          return {
            success: false,
            message: refreshData.message || 'Failed to refresh token',
            code: refreshData.code || 'TOKEN_REFRESH_ERROR'
          };
        }
        
        const refreshData = await refreshResponse.json();
        const newAccessToken = refreshData.accessToken;
        
        localStorage.setItem('accessToken', newAccessToken);
        
        response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newAccessToken}`
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
      }
      
      const data = await response.json();
      return { 
        success: response.ok,
        message: data.message,
        code: data.code
      };
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        message: 'Failed to connect to server',
        code: 'CONNECTION_ERROR'
      };
    }
  }
}; 

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

export const ProfileFormRedesigned = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Profile state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [originalFullName, setOriginalFullName] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(true);
  const [setupMode, setSetupMode] = useState(false);
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [disableCode, setDisableCode] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/users/me`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        setFullName(userData.fullName || '');
        setUsername(userData.username || '');
        setEmail(userData.email || '');
        setOriginalFullName(userData.fullName || '');
        setOriginalUsername(userData.username || '');
        setIsDirty(false);
      } catch (err) {
        toast({
          title: t('profile.error'),
          description: err instanceof Error ? err.message : 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [toast, t]);

  // Update form when user data changes (fallback from context)
  useEffect(() => {
    if (user && isLoading) {
      setFullName(user.fullName);
      setUsername(user.username);
      setEmail(user.email || '');
      setOriginalFullName(user.fullName);
      setOriginalUsername(user.username);
      setIsDirty(false);
    }
  }, [user, isLoading]);

  // Check for dirty state in profile tab
  useEffect(() => {
    setIsDirty(
      fullName !== originalFullName || 
      username !== originalUsername
    );
  }, [fullName, username, originalFullName, originalUsername]);

  // Fetch 2FA status on mount
  useEffect(() => {
    async function fetchStatus() {
      try {
        const status = await TwoFactorAuthService.getStatus();
        setIs2FAEnabled(status);
      } catch (error) {
        console.error('Failed to fetch 2FA status:', error);
      } finally {
        setIs2FALoading(false);
      }
    }
    
    fetchStatus();
  }, []);

  // Handle profile form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update profile information
      const response = await authenticatedFetch(`${API_BASE_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          username,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t('profile.errorUpdating'));
      }

      // Refresh user data
      await refreshUser();
      
      // Update original values
      setOriginalFullName(fullName);
      setOriginalUsername(username);
      setIsDirty(false);
      
      toast({
        title: t('profile.success'),
        description: t('profile.profileUpdated'),
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: t('profile.error'),
        description: err instanceof Error ? err.message : t('profile.errorUpdating'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast({
        title: t('security.error'),
        description: t('security.passwordsDoNotMatch'),
        variant: 'destructive',
      });
      return;
    }
    
    // Check that new password is different from current
    if (currentPassword === newPassword) {
      toast({
        title: t('security.error'),
        description: t('security.newPasswordSameAsCurrent'),
        variant: 'destructive',
      });
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const result = await PasswordService.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        toast({
          title: t('security.passwordChanged'),
          description: t(`security.${result.code}Description`) || result.message,
          variant: 'default',
        });
        
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({
          title: t('security.error'),
          description: t(`security.${result.code}`) || result.message || t('security.invalidCurrentPassword'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('security.error'),
        description: t('security.passwordChangeError'),
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Setup 2FA
  const handleSetup2FA = async () => {
    setIs2FALoading(true);
    
    try {
      const { secret } = await TwoFactorAuthService.enable();
      
      // Validate the secret - it should be a base32 string
      const isValidBase32 = /^[A-Z2-7]+=*$/.test(secret);
      if (!isValidBase32) {
        throw new Error(t('security.twoFactorSetupError'));
      }
      
      setSecret(secret);
      setSetupMode(true);
      
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      toast({
        title: t('security.error'),
        description: error instanceof Error ? error.message : t('security.twoFactorSetupError'),
        variant: 'destructive',
      });
    } finally {
      setIs2FALoading(false);
    }
  };
  
  // Verify 2FA setup
  const handleVerify2FA = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      toast({
        title: t('security.invalidCode'),
        description: t('security.enterValidCode'),
        variant: 'destructive',
      });
      return;
    }
    
    // Check if user ID is available
    if (!user?.id) {
      toast({
        title: t('security.error'),
        description: t('security.missingUserData'),
        variant: 'destructive',
      });
      return;
    }
    
    setVerifying(true);
    
    try {
      const success = await TwoFactorAuthService.verify(verificationCode, user.id);
      
      if (success) {
        toast({
          title: t('security.twoFactorEnabled'),
          description: t('security.twoFactorEnabledDescription'),
          variant: 'default',
        });
        
        setIs2FAEnabled(true);
        setSetupMode(false);
        setSecret('');
        setVerificationCode('');
      } else {
        toast({
          title: t('security.invalidCode'),
          description: t('security.verificationFailed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('security.error'),
        description: t('security.verificationError'),
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };
  
  // Start disable 2FA process
  const handleStartDisable2FA = () => {
    setShowDisableForm(true);
  };
  
  // Actual disable method using code
  const handleDisable2FA = async () => {
    if (!disableCode.trim() || disableCode.length !== 6) {
      toast({
        title: t('security.invalidCode'),
        description: t('security.enterValidCode'),
        variant: 'destructive',
      });
      return;
    }
    
    setDisabling(true);
    
    try {
      const success = await TwoFactorAuthService.disable(disableCode);
      
      if (success) {
        setIs2FAEnabled(false);
        setShowDisableForm(false);
        setDisableCode('');
        toast({
          title: t('security.twoFactorDisabled'),
          description: t('security.twoFactorDisabledDescription'),
          variant: 'default',
        });
      } else {
        toast({
          title: t('security.invalidCode'),
          description: t('security.verificationFailed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('security.error'),
        description: t('security.disableError'),
        variant: 'destructive',
      });
    } finally {
      setDisabling(false);
    }
  };
  
  // Cancel disable action
  const handleCancelDisable = () => {
    setShowDisableForm(false);
    setDisableCode('');
  };
  
  // Generate QR code URL for 2FA setup
  const getQRCodeURL = () => {
    const issuer = encodeURIComponent('Pixi');
    const accountName = encodeURIComponent(email || username);
    
    return `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
  };

  // Format the secret key for display (groups of 4 characters)
  const formatSecretForDisplay = (secret: string): string => {
    return secret.replace(/(.{4})/g, '$1 ').trim();
  };

  if (isLoading) {
    return (
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex justify-center items-center min-h-[400px]"
      >
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">{t('profile.loading')}</span>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="w-full max-w-3xl mx-auto"
    >
      <Tabs 
        defaultValue="profile" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex justify-center w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="profile">{t('profile.tabs.profile')}</TabsTrigger>
            <TabsTrigger value="password">{t('profile.tabs.password')}</TabsTrigger>
            <TabsTrigger value="2fa">{t('profile.tabs.twoFactor')}</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <AnimatePresence mode="wait">
            <motion.div
              key="profile-tab"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={tabVariants}
            >
              <Card className="w-full shadow-md">
                <CardHeader>
                  <CardTitle>{t('profile.title')}</CardTitle>
                  <CardDescription>
                    {t('profile.description')}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <motion.div 
                        className="space-y-2"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Label htmlFor="fullName">{t('profile.fullName')}</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={isSubmitting}
                          required
                          className="transition-all"
                        />
                      </motion.div>

                      <motion.div 
                        className="space-y-2"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Label htmlFor="username">{t('profile.username')}</Label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={isSubmitting}
                          required
                          className="transition-all"
                        />
                        <p className="text-sm text-muted-foreground">
                          {t('profile.usernameDescription')}
                        </p>
                      </motion.div>

                      <motion.div 
                        className="space-y-2"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Label htmlFor="email">{t('profile.email')}</Label>
                        <Input
                          id="email"
                          value={email}
                          disabled={true}
                          className="bg-muted"
                        />
                        <p className="text-sm text-muted-foreground">
                          {t('profile.emailDescription')}
                        </p>
                      </motion.div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <motion.div
                      variants={buttonVariants}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                      className="ml-auto"
                    >
                      <Button 
                        type="submit" 
                        disabled={isSubmitting || !isDirty}
                        className={`transition-all ${!isDirty ? 'opacity-50' : 'opacity-100'}`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('profile.saving')}
                          </>
                        ) : (
                          t('profile.saveChanges')
                        )}
                      </Button>
                    </motion.div>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
        
        {/* Password Tab */}
        <TabsContent value="password">
          <AnimatePresence mode="wait">
            <motion.div
              key="password-tab"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={tabVariants}
            >
              <Card className="w-full shadow-md">
                <CardHeader>
                  <CardTitle>{t('security.passwordTitle')}</CardTitle>
                  <CardDescription>
                    {t('security.passwordDescription')}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handlePasswordChange}>
                  <CardContent className="space-y-4">
                    <motion.div 
                      className="space-y-2"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label htmlFor="currentPassword">{t('security.currentPassword')}</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          disabled={passwordLoading}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showCurrentPassword ? t('security.hidePassword') : t('security.showPassword')}
                          </span>
                        </Button>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-2"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label htmlFor="newPassword">{t('security.newPassword')}</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          disabled={passwordLoading}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showNewPassword ? t('security.hidePassword') : t('security.showPassword')}
                          </span>
                        </Button>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-2"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label htmlFor="confirmPassword">{t('security.confirmPassword')}</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={passwordLoading}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword ? t('security.hidePassword') : t('security.showPassword')}
                          </span>
                        </Button>
                      </div>
                    </motion.div>
                  </CardContent>
                  
                  <CardFooter>
                    <motion.div
                      variants={buttonVariants}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                      className="ml-auto"
                    >
                      <Button
                        type="submit"
                        disabled={
                          passwordLoading || 
                          !currentPassword || 
                          !newPassword || 
                          !confirmPassword || 
                          newPassword !== confirmPassword ||
                          currentPassword === newPassword
                        }
                        className="transition-all"
                      >
                        {passwordLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('security.changingPassword')}
                          </>
                        ) : (
                          t('security.changePassword')
                        )}
                      </Button>
                    </motion.div>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
        
        {/* 2FA Tab */}
        <TabsContent value="2fa">
          <AnimatePresence mode="wait">
            <motion.div
              key="2fa-tab"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={tabVariants}
            >
              <Card className="w-full shadow-md overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>{t('security.twoFactorTitle')}</span>
                  </CardTitle>
                  <CardDescription>
                    {t('security.twoFactorDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {is2FALoading ? (
                    <motion.div 
                      className="flex justify-center p-4"
                      animate={{ opacity: 1 }}
                      initial={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </motion.div>
                  ) : setupMode ? (
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Alert>
                        <AlertTitle className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          {t('security.important')}
                        </AlertTitle>
                        <AlertDescription>
                          {t('security.setupInstructions')}
                        </AlertDescription>
                      </Alert>
                      
                      <motion.div 
                        className="flex justify-center p-4 bg-white rounded-lg w-fit mx-auto"
                        whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)" }}
                        transition={{ duration: 0.3 }}
                      >
                        <QRCodeSVG value={getQRCodeURL()} size={200} />
                      </motion.div>
                      
                      <motion.div 
                        className="space-y-2"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Label htmlFor="secretKey">{t('security.secretKey')}</Label>
                        <div className="flex">
                          <Input
                            id="secretKey"
                            value={formatSecretForDisplay(secret)}
                            readOnly
                            className="font-mono text-center tracking-wider"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('security.secretKeyInstructions')}
                        </p>
                      </motion.div>
                      
                      <Separator />
                      
                      <motion.div 
                        className="space-y-4"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Label htmlFor="verificationCode">{t('security.verificationCode')}</Label>
                        <Input
                          id="verificationCode"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                          maxLength={6}
                          placeholder="000000"
                          className="text-center tracking-widest text-lg"
                        />
                        
                        <div className="flex space-x-2 justify-end">
                          <motion.div
                            variants={buttonVariants}
                            initial="idle"
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setSetupMode(false);
                                setSecret('');
                                setVerificationCode('');
                              }}
                              disabled={verifying}
                            >
                              {t('security.cancel')}
                            </Button>
                          </motion.div>
                          <motion.div
                            variants={buttonVariants}
                            initial="idle"
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Button 
                              onClick={handleVerify2FA}
                              disabled={verifying || verificationCode.length !== 6}
                            >
                              {verifying ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  {t('auth.verifying')}
                                </>
                              ) : (
                                t('security.verifyAndActivate')
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ) : is2FAEnabled ? (
                    <AnimatePresence mode="wait">
                      {showDisableForm ? (
                        <motion.div 
                          className="space-y-4"
                          key="disable-form"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Alert className="bg-green-50 border-green-200">
                            <Check className="h-4 w-4 text-green-500" />
                            <AlertDescription className="text-green-700">
                              {t('security.twoFactorEnabledText')}
                            </AlertDescription>
                          </Alert>
                          
                          <div className="space-y-4">
                            <motion.div 
                              className="space-y-2"
                              whileHover={{ scale: 1.01 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Label htmlFor="disableCode">{t('security.enterCurrentCode')}</Label>
                              <Input
                                id="disableCode"
                                value={disableCode}
                                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                maxLength={6}
                                placeholder="000000"
                                className="text-center tracking-widest text-lg mt-2"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {t('security.currentCodeInstructions')}
                              </p>
                            </motion.div>
                            
                            <Alert variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                {t('security.disableSecurity')}
                              </AlertDescription>
                            </Alert>
                            
                            <div className="flex justify-end space-x-2">
                              <motion.div
                                variants={buttonVariants}
                                initial="idle"
                                whileHover="hover"
                                whileTap="tap"
                              >
                                <Button variant="outline" onClick={handleCancelDisable} disabled={disabling}>
                                  {t('security.cancel')}
                                </Button>
                              </motion.div>
                              <motion.div
                                variants={buttonVariants}
                                initial="idle"
                                whileHover="hover"
                                whileTap="tap"
                              >
                                <Button 
                                  variant="destructive"
                                  onClick={handleDisable2FA}
                                  disabled={disabling || disableCode.length !== 6}
                                >
                                  {disabling ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      {t('security.disabling')}
                                    </>
                                  ) : (
                                    t('security.disable2FA')
                                  )}
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          className="space-y-4"
                          key="enabled-status"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Alert className="bg-green-50 border-green-200">
                            <Check className="h-4 w-4 text-green-500" />
                            <AlertDescription className="text-green-700">
                              {t('security.twoFactorEnabledText')}
                            </AlertDescription>
                          </Alert>
                          
                          <div className="flex justify-end">
                            <motion.div
                              variants={buttonVariants}
                              initial="idle"
                              whileHover="hover"
                              whileTap="tap"
                            >
                              <Button 
                                variant="destructive"
                                onClick={handleStartDisable2FA}
                              >
                                {t('security.disable2FA')}
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ) : (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.p 
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        {t('security.twoFactorDisabledText')}
                      </motion.p>
                      
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <AlertDescription>
                            {t('security.recommendationText')}
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                      
                      <div className="flex justify-end">
                        <motion.div
                          variants={buttonVariants}
                          initial="idle"
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Button
                            onClick={handleSetup2FA}
                            disabled={is2FALoading}
                            className="relative overflow-hidden group"
                          >
                            {is2FALoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('security.loading')}
                              </>
                            ) : (
                              <>
                                <span className="relative z-10">{t('security.enable2FA')}</span>
                                <motion.div 
                                  className="absolute inset-0 bg-primary/10"
                                  initial={{ x: '-100%' }}
                                  whileHover={{ x: 0 }}
                                  transition={{ duration: 0.4 }}
                                />
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}; 