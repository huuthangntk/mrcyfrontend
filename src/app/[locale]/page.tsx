"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import HeroSection from '@/components/HeroSection';
import SecurityFeatures from '@/components/SecurityFeatures';
import FeaturesSection from '@/components/FeaturesSection';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import EmailVerificationModal from '@/components/EmailVerificationModal';
import TwoFactorModal from '@/components/TwoFactorModal';

export default function Home() {
  // Modal state management
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Handle modal flows
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    
    // Mock 2FA check - in a real app, you'd check if the user has 2FA enabled
    const userHas2FA = true;
    
    if (userHas2FA) {
      setIs2FAModalOpen(true);
    }
  };

  const handleRegisterSuccess = (email: string, userData: any) => {
    setRegisteredEmail(email);
    setUserData(userData);
    setIsRegisterModalOpen(false);
    setIsVerificationModalOpen(true);
  };

  const handleVerificationSuccess = () => {
    setIsVerificationModalOpen(false);
    
    // The tokens are stored by EmailVerificationModal
    // Redirect to dashboard
    const locale = pathname.split('/')[1] || 'en';
    router.push(`/${locale}/dashboard`);
  };

  const handle2FASuccess = () => {
    setIs2FAModalOpen(false);
    // Redirect to dashboard or authenticated area
  };

  // Close all modals
  const closeAllModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    setIsVerificationModalOpen(false);
    setIs2FAModalOpen(false);
  };

  // Open login modal
  const openLoginModal = () => {
    closeAllModals();
    setIsLoginModalOpen(true);
  };

  // Open register modal
  const openRegisterModal = () => {
    closeAllModals();
    setIsRegisterModalOpen(true);
  };

  // Expose modal controls to window for external triggers (e.g., from header)
  if (typeof window !== 'undefined') {
    window.openLoginModal = openLoginModal;
    window.openRegisterModal = openRegisterModal;
  }

  return (
    <main className="space-y-0">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Security Features Section */}
      <SecurityFeatures />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Authentication Modals */}
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
      
      <EmailVerificationModal 
        isOpen={isVerificationModalOpen} 
        onClose={() => setIsVerificationModalOpen(false)}
        onSuccess={handleVerificationSuccess}
        email={registeredEmail}
        userData={userData}
      />
      
      <TwoFactorModal 
        isOpen={is2FAModalOpen} 
        onClose={() => setIs2FAModalOpen(false)}
        onSuccess={handle2FASuccess}
      />
    </main>
  );
} 