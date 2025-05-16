"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import TwoFactorModal from '@/components/TwoFactorModal';
import EmailVerificationModal from '@/components/EmailVerificationModal';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface LoginClientProps {
  locale: string;
}

const LoginClient: React.FC<LoginClientProps> = ({ locale }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState("login");
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [userData, setUserData] = useState<any>(null);
  
  // Set global functions for the header to use
  useEffect(() => {
    // Define global window functions for header to open modals
    window.openLoginModal = () => setShowLoginModal(true);
    window.openRegisterModal = () => setShowRegisterModal(true);
    
    // Clean up on unmount
    return () => {
      window.openLoginModal = undefined;
      window.openRegisterModal = undefined;
    };
  }, []);
  
  // Listen for custom event to open forgot password modal
  useEffect(() => {
    const handleGlobalForgotPassword = () => {
      console.log("Custom event caught: open-forgot-password-modal");
      setShowLoginModal(false);
      setShowForgotPasswordModal(true);
    };
    
    console.log("Adding event listener for open-forgot-password-modal");
    window.addEventListener('open-forgot-password-modal', handleGlobalForgotPassword);
    
    return () => {
      console.log("Removing event listener for open-forgot-password-modal");
      window.removeEventListener('open-forgot-password-modal', handleGlobalForgotPassword);
    };
  }, []);
  
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
      setShowLoginModal(true);
      setShowRegisterModal(false);
    } else {
      setShowLoginModal(false);
      setShowRegisterModal(true);
    }
  }, [activeTab]);
  
  // Function to handle forgot password from LoginModal
  const handleForgotPasswordClick = () => {
    setShowLoginModal(false);
    setShowForgotPasswordModal(true);
  };
  
  // Handle login success (could trigger 2FA)
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setShowTwoFactorModal(true);
  };
  
  // Handle 2FA success
  const handleTwoFactorSuccess = () => {
    setShowTwoFactorModal(false);
    const redirectTo = searchParams.get('redirect') || `/${locale}/dashboard`;
    router.push(redirectTo);
  };
  
  const handleRegisterSuccess = (email: string, userData: any) => {
    setShowRegisterModal(false);
    setRegisteredEmail(email);
    setUserData(userData);
    setShowVerificationModal(true);
  };
  
  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    setActiveTab("login");
    setShowLoginModal(true);
  };
  
  // Handle forgot password success
  const handleForgotPasswordSuccess = () => {
    setShowForgotPasswordModal(false);
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
          
          {/* Test button for direct access */}
          <Button 
            onClick={() => setShowForgotPasswordModal(true)}
            variant="outline"
            className="mt-4"
            size="sm"
          >
            Test Forgot Password
          </Button>
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
                onClick={() => setShowLoginModal(true)} 
                className="w-full"
                size="lg"
              >
                Sign In to Your Account
              </Button>
              
              <div className="text-center">
                <button 
                  onClick={handleForgotPasswordClick}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="register">
            <div className="space-y-4">
              <Button 
                onClick={() => setShowRegisterModal(true)} 
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
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        onForgotPassword={handleForgotPasswordClick}
      />
      
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)} 
        onSuccess={handleRegisterSuccess}
      />
      
      {showTwoFactorModal && (
        <TwoFactorModal
          isOpen={showTwoFactorModal}
          onClose={() => setShowTwoFactorModal(false)}
          onSuccess={handleTwoFactorSuccess}
        />
      )}
      
      <EmailVerificationModal 
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={handleVerificationSuccess}
        email={registeredEmail}
        userData={userData}
      />
      
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onSuccess={handleForgotPasswordSuccess}
      />
    </div>
  );
};

export default LoginClient; 