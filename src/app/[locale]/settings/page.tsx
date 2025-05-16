"use client";

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/client';
import { Locale } from '@/lib/i18n/config';
import ProtectedRoute from '@/components/ProtectedRoute';
import SecuritySettings from '@/components/settings/SecuritySettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Bell, Globe, User } from 'lucide-react';

interface SettingsPageProps {
  params: {
    locale: string;
  };
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const { t } = useTranslation(params.locale as Locale, 'settings');
  const [activeTab, setActiveTab] = useState("security");
  
  return (
    <ProtectedRoute>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">{t('settings.title', 'Settings')}</h1>
        
        <Tabs 
          defaultValue="security" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>{t('settings.tabs.security', 'Security')}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>{t('settings.tabs.notifications', 'Notifications')}</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{t('settings.tabs.preferences', 'Preferences')}</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>{t('settings.tabs.language', 'Language')}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>
          
          <TabsContent value="notifications">
            <div className="p-6 bg-muted/40 rounded-lg text-center">
              <p className="text-muted-foreground">{t('settings.notifications.comingSoon', 'Notification settings coming soon')}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="preferences">
            <div className="p-6 bg-muted/40 rounded-lg text-center">
              <p className="text-muted-foreground">{t('settings.preferences.comingSoon', 'Preference settings coming soon')}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="language">
            <div className="p-6 bg-muted/40 rounded-lg text-center">
              <p className="text-muted-foreground">{t('settings.language.comingSoon', 'Language settings coming soon')}</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}; 