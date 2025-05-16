"use client";

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProfileForm from '@/components/ProfileForm';
import { useTranslation } from '@/lib/i18n/client';
import { Locale } from '@/lib/i18n/config';

interface ProfilePageProps {
  params: {
    locale: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { t } = useTranslation(params.locale as Locale, 'profile');
  
  return (
    <ProtectedRoute>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">{t('profile.title', 'Profile')}</h1>
        <ProfileForm />
      </div>
    </ProtectedRoute>
  );
} 