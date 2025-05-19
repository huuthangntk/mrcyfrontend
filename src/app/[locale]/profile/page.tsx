"use client";

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ProfileFormRedesigned } from '@/components/ProfileFormRedesigned';
import { useTranslation } from '@/lib/i18n/TranslationProvider';

interface ProfilePageProps {
  params: {
    locale: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { t } = useTranslation();
  
  return (
    <ProtectedRoute>
      <div className="container py-10 max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">{t('profile.title')}</h1>
        <ProfileFormRedesigned />
      </div>
    </ProtectedRoute>
  );
} 