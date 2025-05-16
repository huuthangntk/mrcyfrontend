"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, Translation, i18nConfig } from './config';
import { loadTranslations } from './translations';

interface TranslationContextType {
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isRtl: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

interface TranslationProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ 
  children, 
  initialLocale = i18nConfig.defaultLocale 
}) => {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [translations, setTranslations] = useState<Translation>({});
  const isRtl = i18nConfig.rtlLanguages.includes(locale);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAndSetTranslations = async () => {
      setIsLoading(true);
      try {
        const loadedTranslations = await loadTranslations(locale);
        setTranslations(loadedTranslations || {});
        
        // Set HTML lang attribute and dir for RTL languages
        document.documentElement.setAttribute('lang', locale);
        document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
      } catch (error) {
        console.error("Error loading translations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAndSetTranslations();
  }, [locale, isRtl]);

  // Translation function 
  const t = (key: string, params?: Record<string, string | number>): string => {
    if (isLoading) {
      return key; // Return key while translations are loading
    }

    // Split the key by dots to access nested properties
    const keys = key.split('.');
    let value = keys.reduce((obj, k) => {
      return obj && typeof obj === 'object' ? (obj as any)[k] : undefined;
    }, translations as any);

    // If no translation found, return the key
    if (typeof value !== 'string') {
      console.warn(`Translation missing: ${key} for locale: ${locale}`);
      return key;
    }

    // Replace parameters in the translation string
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = (value as string).replace(`{{${paramKey}}}`, String(paramValue));
      });
    }

    return value as string;
  };

  const value = {
    t,
    locale,
    setLocale,
    isRtl,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationProvider; 