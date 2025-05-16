"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import TranslationProvider from "@/lib/i18n/TranslationProvider";
import { Locale } from "@/lib/i18n/config";
import { AuthProvider } from "@/contexts/AuthContext";

type ProvidersProps = {
  children: React.ReactNode;
  locale?: Locale;
}

export function Providers({ children, locale = "en" as Locale }: ProvidersProps) {
  return (
    <TranslationProvider initialLocale={locale}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </NextThemesProvider>
    </TranslationProvider>
  );
} 