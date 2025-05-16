import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { i18nConfig, Locale } from "@/lib/i18n/config";
import { Providers } from "@/providers";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  // Access params in an async function
  const locale = params.locale;
  
  // Validate that the locale is supported
  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  return (
    <Providers locale={locale as Locale}>
      <Header currentLanguage={locale} />
      {children}
      <Footer />
    </Providers>
  );
} 