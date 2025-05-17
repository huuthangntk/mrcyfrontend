"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { i18nConfig, Locale } from "@/lib/i18n/config";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { FiUsers, FiMail, FiLogIn, FiUserPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useTranslation } from "@/lib/i18n/TranslationProvider";
import { authService } from '@/services/authService';
import LoginModal from './LoginModal';

type HeaderProps = {
    currentLanguage?: string;
};

export const Header: React.FC<HeaderProps> = ({ currentLanguage = "en" }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { t, setLocale, locale } = useTranslation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

    // Use the locale from the context if available, otherwise use the prop
    const activeLocale = locale || currentLanguage as Locale;

    // Ensure component is mounted before rendering client-side content
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Handle scroll effect for header
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Check authentication status on mount and when auth changes
    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(authService.isAuthenticated());
        };
        
        // Check on mount
        checkAuth();
        
        // Set up storage event listener to detect auth changes
        const handleStorageChange = () => {
            checkAuth();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Function to handle language change
    const handleLanguageChange = (locale: string) => {
        setLocale(locale as Locale);
        
        // Extract the path segments
        const segments = pathname.split('/').filter(Boolean);
        
        // If we have a path with a locale, replace it; otherwise just use the new locale
        let newPath;
        if (segments.length > 0 && i18nConfig.locales.includes(segments[0] as Locale)) {
            // Replace the current locale with the new one
            segments[0] = locale;
            newPath = `/${segments.join('/')}`;
        } else {
            // Just use the new locale (should not happen with our current routing setup)
            newPath = `/${locale}`;
        }
        
        router.push(newPath);
    };

    // Handle login button click
    const handleLoginClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isMounted && window.openLoginModal) {
            window.openLoginModal();
        }
    };

    // Handle register button click
    const handleRegisterClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isMounted && window.openRegisterModal) {
            window.openRegisterModal();
        }
    };

    // Check if language is RTL
    const isRtl = i18nConfig.rtlLanguages.includes(activeLocale);

    // Toggle mobile menu
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setShowLoginModal(false);
    };
    
    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
        router.push('/');
    };

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background"
                }`}
            dir={isRtl ? "rtl" : "ltr"}
        >
            <div className="container mx-auto py-3 px-4">
                <div className="flex items-center justify-between">
                    {/* Logo - Increased size */}
                    <Link href={`/${activeLocale}`} className="flex items-center">
                        <Image
                            src="/mercy.png"
                            alt="Logo"
                            width={60}
                            height={60}
                            className="object-contain"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link href={`/${activeLocale}/about`} className="nav-link">
                                            {t('common.aboutUs')}
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link href={`/${activeLocale}/contact`} className="nav-link">
                                            {t('common.contactUs')}
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>

                        {isAuthenticated ? (
                            <Button onClick={handleLogout} variant="outline">
                                {t('common.logout')}
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setShowLoginModal(true)}>
                                    {t('common.login')}
                                </Button>
                                <Button asChild>
                                    <Link href="/register">
                                        {t('common.register')}
                                    </Link>
                                </Button>
                            </>
                        )}

                        {/* Language Selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Globe className="h-5 w-5" />
                                    <span className="sr-only">{t('common.selectLanguage')}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {Object.entries(i18nConfig.localeNames).map(([locale, name]) => (
                                    <DropdownMenuItem
                                        key={locale}
                                        onClick={() => handleLanguageChange(locale)}
                                        className={
                                            locale === activeLocale ? "bg-primary text-primary-foreground" : ""
                                        }
                                    >
                                        {name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-4">
                        {/* Language Selector for Mobile */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Globe className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {Object.entries(i18nConfig.localeNames).map(([locale, name]) => (
                                    <DropdownMenuItem
                                        key={locale}
                                        onClick={() => handleLanguageChange(locale)}
                                        className={
                                            locale === activeLocale ? "bg-primary text-primary-foreground" : ""
                                        }
                                    >
                                        {name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="ghost" size="icon" onClick={toggleMenu}>
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden fixed inset-x-0 top-[65px] bg-background/95 backdrop-blur-sm shadow-sm transition-all duration-300 ease-in-out z-40 overflow-hidden ${isMenuOpen ? "max-h-screen" : "max-h-0"
                    }`}
            >
                <div className="container mx-auto py-4 px-4 flex flex-col space-y-4">
                    <Link
                        href={`/${activeLocale}/about`}
                        className="flex items-center text-foreground hover:text-primary py-2 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <FiUsers className="mr-2 h-5 w-5" />
                        {t('common.aboutUs')}
                    </Link>
                    <Link
                        href={`/${activeLocale}/contact`}
                        className="flex items-center text-foreground hover:text-primary py-2 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <FiMail className="mr-2 h-5 w-5" />
                        {t('common.contactUs')}
                    </Link>
                    <a
                        href="#"
                        className="flex items-center text-foreground hover:text-primary py-2 transition-colors"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsMenuOpen(false);
                            handleLoginClick(e);
                        }}
                    >
                        <FiLogIn className="mr-2 h-5 w-5" />
                        {t('common.login')}
                    </a>
                    <a
                        href="#"
                        className="flex items-center text-foreground hover:text-primary py-2 transition-colors"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsMenuOpen(false);
                            handleRegisterClick(e);
                        }}
                    >
                        <FiUserPlus className="mr-2 h-5 w-5" />
                        {t('common.register')}
                    </a>
                </div>
            </div>

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={handleLoginSuccess}
                onForgotPassword={() => {
                    setShowLoginModal(false);
                    setShowForgotPasswordModal(true);
                }}
            />

            {/* Add styles for nav link animations */}
            <style jsx global>{`
                .nav-link {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 500;
                    font-size: 0.95rem;
                    height: 2.5rem;
                    padding-left: 1rem;
                    padding-right: 1rem;
                    border-radius: 0.5rem;
                    transition: all 0.3s ease;
                }

                .nav-link::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0.5rem;
                    left: 50%;
                    background-color: hsl(var(--primary));
                    transform: translateX(-50%);
                    transition: width 0.3s ease;
                }

                .nav-link:hover {
                    color: hsl(var(--primary));
                }

                .nav-link:hover::after {
                    width: 60%;
                }

                .nav-link:active {
                    transform: translateY(1px);
                }
            `}</style>
        </header>
    );
};

declare global {
    interface Window {
        openLoginModal?: () => void;
        openRegisterModal?: () => void;
    }
}

export default Header; 