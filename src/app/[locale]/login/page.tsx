import React from 'react';
import LoginClient from '@/components/LoginClient';

interface LoginPageProps {
  params: {
    locale: string;
  };
}

export default function LoginPage({ params }: LoginPageProps) {
  // Properly unwrap the params using React.use()
  const locale = React.use(Promise.resolve(params.locale));
  
  return <LoginClient locale={locale} />;
} 