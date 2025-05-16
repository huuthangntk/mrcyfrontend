// src/app/layout.tsx (Modified)
import './globals.css';
import { Providers } from "@/providers";
import { Inter } from "next/font/google";
import localFont from 'next/font/local';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { i18nConfig, Locale } from "@/lib/i18n/config";
import { Toaster } from "@/components/ui/toaster"; // Import the Toaster component

// Import local font
const lalezar = localFont({ 
  src: '../../public/fonts/lalezar.ttf',
  variable: '--font-lalezar',
  display: 'swap'
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Mercy",
  description: "Mercy Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={i18nConfig.defaultLocale} suppressHydrationWarning>
      <body className={`${inter.variable} ${lalezar.variable} font-lalezar min-h-screen flex flex-col`}>
        <Providers>
          <main className="flex-grow">
            {children}
          </main>
          <Toaster /> {/* Add the Toaster component */}
        </Providers>
      </body>
    </html>
  );
}