export type Locale = 'en' | 'fr' | 'es' | 'de' | 'ar' | 'zh' | 'ru' | 'fa' | 'hi';

export const i18nConfig = {
  defaultLocale: 'en' as Locale,
  locales: ['en', 'fr', 'es', 'de', 'ar', 'zh', 'ru', 'fa', 'hi'] as Locale[],
  localeNames: {
    en: 'English',
    fr: 'Français',
    es: 'Español',
    de: 'Deutsch',
    ar: 'العربية',
    zh: '中文',
    ru: 'Русский',
    fa: 'فارسی',
    hi: 'हिन्दी',
  },
  rtlLanguages: ['ar', 'fa'],
};

export type Translation = {
  [key: string]: string | Translation;
};

export type Translations = {
  [locale in Locale]: Translation;
}; 