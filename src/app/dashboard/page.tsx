"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/TranslationProvider';

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Ensure we're running in the browser
    if (typeof window === 'undefined') return;
    
    // Check if user is authenticated
    const checkAuth = () => {
      const authState = authService.isAuthenticated();
      setIsAuthenticated(authState);
      
      if (!authState) {
        // If not authenticated, redirect to login page
        router.push('/');
      } else {
        // If authenticated, finish loading
        setIsLoading(false);
      }
    };
    
    // Small delay to ensure browser has initialized storage
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    
    // Listen for authentication state changes
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);
  
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4">{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">{t('dashboard.title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.welcome')}</CardTitle>
            <CardDescription>{t('dashboard.welcomeMessage')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{t('dashboard.startExploring')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.stats')}</CardTitle>
            <CardDescription>{t('dashboard.statsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t('dashboard.totalVisits')}</span>
                <span className="font-medium">124</span>
              </div>
              <div className="flex justify-between">
                <span>{t('dashboard.completedTasks')}</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span>{t('dashboard.pendingTasks')}</span>
                <span className="font-medium">3</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            <CardDescription>{t('dashboard.quickActionsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                {t('dashboard.createTask')}
              </button>
              <button className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors">
                {t('dashboard.viewReports')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 