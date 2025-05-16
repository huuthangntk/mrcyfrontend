import { NextRequest, NextResponse } from 'next/server';
import { i18nConfig } from './lib/i18n/config';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the pathname is missing a locale
  const pathnameIsMissingLocale = i18nConfig.locales.every(
    locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // If there's no locale, redirect to the default locale
  if (pathnameIsMissingLocale) {
    // Get the preferred locale from the Accept-Language header
    const acceptLanguage = request.headers.get('accept-language') || '';
    const preferredLocale = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim())
      .find(lang => i18nConfig.locales.includes(lang.split('-')[0]));

    // Use preferred locale or default to the default locale
    const locale = preferredLocale ? preferredLocale.split('-')[0] : i18nConfig.defaultLocale;

    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`, request.url)
    );
  }
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)']
}; 