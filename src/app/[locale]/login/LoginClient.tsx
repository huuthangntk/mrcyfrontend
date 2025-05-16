"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import TwoFactorModal from '@/components/TwoFactorModal';
import EmailVerificationModal from '@/components/EmailVerificationModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface LoginClientProps {
  locale: string;
}

export default function LoginClient({ locale }: LoginClientProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState("login");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [userData, setUserData] = useState<any>(null);
  
  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const redirectTo = searchParams.get('redirect') || `/${locale}/dashboard`;
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, searchParams, locale]);
  
  // Handle tab changes
  useEffect(() => {
    if (activeTab === "login") {
      setIsLoginModalOpen(true);
      setIsRegisterModalOpen(false);
    } else {
      setIsLoginModalOpen(false);
      setIsRegisterModalOpen(true);
    }
  }, [activeTab]);
  
  const handleLoginSuccess = () => {
    // For demo, we'll simulate 2FA being required
    setIsLoginModalOpen(false);
    setIs2FAModalOpen(true);
  };
  
  const handle2FASuccess = () => {
    setIs2FAModalOpen(false);
    const redirectTo = searchParams.get('redirect') || `/${locale}/dashboard`;
    router.push(redirectTo);
  };
  
  const handleRegisterSuccess = (email: string, userData: any) => {
    setIsRegisterModalOpen(false);
    setRegisteredEmail(email);
    setUserData(userData);
    setIsVerificationModalOpen(true);
  };
  
  const handleVerificationSuccess = () => {
    setIsVerificationModalOpen(false);
    setActiveTab("login");
    setIsLoginModalOpen(true);
  };
  
  // If still checking auth status, show loading
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-bold">Welcome to Our App</h1>
          <p className="text-muted-foreground">
            Sign in to your account or create a new one
          </p>
        </div>
        
        <Tabs 
          defaultValue="login" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Register
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <div className="space-y-4">
              <Button 
                onClick={() => setIsLoginModalOpen(true)} 
                className="w-full"
                size="lg"
              >
                Sign In to Your Account
              </Button>
              
              <div className="text-center">
                <Link 
                  href={`/${locale}/forgot-password`}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="register">
            <div className="space-y-4">
              <Button 
                onClick={() => setIsRegisterModalOpen(true)} 
                className="w-full"
                size="lg"
              >
                Create a New Account
              </Button>
              
              <div className="text-center text-sm">
                <p className="text-muted-foreground">
                  By registering, you agree to our{" "}
                  <Link 
                    href="/terms" 
                    className="text-primary hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link 
                    href="/privacy" 
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSuccess={handleLoginSuccess}
      />
      
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
        onSuccess={handleRegisterSuccess}
      />
      
      <TwoFactorModal 
        isOpen={is2FAModalOpen} 
        onClose={() => setIs2FAModalOpen(false)} 
        onSuccess={handle2FASuccess}
      />
      
      <EmailVerificationModal 
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSuccess={handleVerificationSuccess}
        email={registeredEmail}
        userData={userData}
      />
    </div>
  );
} 