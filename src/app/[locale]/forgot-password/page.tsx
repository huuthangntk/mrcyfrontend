import React from 'react';
import ForgotPasswordClient from '@/components/ForgotPasswordClient';

interface ForgotPasswordPageProps {
  params: {
    locale: string;
  };
}

export default function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  // Properly unwrap the params using React.use()
  const locale = React.use(Promise.resolve(params.locale));
  
  return <ForgotPasswordClient locale={locale} />;
} 