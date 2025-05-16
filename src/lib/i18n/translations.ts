import { Locale, Translation, Translations } from './config';

// Import individual language files
import en from './locales/en';
import fr from './locales/fr';
import es from './locales/es';
import de from './locales/de';
import ar from './locales/ar';
import zh from './locales/zh';
import ru from './locales/ru';
import fa from './locales/fa';
import hi from './locales/hi';

const translations: Translations = {
  en,
  fr,
  es,
  de,
  ar,
  zh,
  ru,
  fa,
  hi
};

export const loadTranslations = async (locale: Locale): Promise<Translation> => {
  // Ensure we return a valid translation object
  const translation = translations[locale] || translations.en;
  if (!translation) {
    console.error(`No translations found for locale: ${locale}, falling back to English`);
    return translations.en;
  }
  return translation;
};

export default translations; 