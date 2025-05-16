"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import {
  Shield,
  Lock,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Database,
  Smartphone,
  MailIcon,
  MessageSquare,
  EyeOff,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Fingerprint,
  MailCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/TranslationProvider';

export const SecurityFeatures: React.FC = () => {
  const { t } = useTranslation();
  const [activeFeature, setActiveFeature] = useState<string>('notifications');
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.2 });
  const controls = useAnimation();
  interface Particle {
    id: number;
    width: number;
    height: number;
    top: number;
    left: number;
    colorIndex: number;
    opacity: number;
    blurRadius: number;
    yMove: number;
    xMove: number;
    duration: number;
    delay: number;
  }
  
  const [particles, setParticles] = useState<Array<Particle>>([]);
  
  // Initialize particles on client-side only
  useEffect(() => {
    // Only run on client side
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      width: Math.random() * 5 + 3,
      height: Math.random() * 5 + 3,
      top: Math.random() * 100,
      left: Math.random() * 100,
      colorIndex: i % 3,
      opacity: Math.random() * 0.3 + 0.2,
      blurRadius: Math.random() * 10 + 5,
      yMove: -Math.random() * 100 - 50,
      xMove: Math.random() * 40 - 20,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, isInView]);

  // Auto-rotate features every 8 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveFeature(prevFeature => {
        if (prevFeature === 'notifications') return 'twoFactor';
        if (prevFeature === 'twoFactor') return 'encryption';
        return 'notifications';
      });
    }, 8000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Security features data
  const securityFeatures = [
    {
      id: 'notifications',
      title: t('securityFeatures.multiChannelAlerts.title'),
      description: t('securityFeatures.multiChannelAlerts.description'),
      icon: <Bell className="h-6 w-6" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/20'
    },
    {
      id: 'twoFactor',
      title: t('securityFeatures.twoFactor.title'),
      description: t('securityFeatures.twoFactor.description'),
      icon: <Smartphone className="h-6 w-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20'
    },
    {
      id: 'encryption',
      title: t('securityFeatures.encryption.title'),
      description: t('securityFeatures.encryption.description'),
      icon: <Database className="h-6 w-6" />,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      borderColor: 'border-emerald-400/20'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Demo notification data
  const notifications = [
    { type: 'login', message: t('securityFeatures.loginMessage'), icon: <UserCheck className="h-4 w-4" /> },
    { type: 'withdraw', message: t('securityFeatures.withdrawMessage'), icon: <ShieldCheck className="h-4 w-4" /> },
    { type: 'security', message: t('securityFeatures.securityMessage'), icon: <Lock className="h-4 w-4" /> }
  ];

  return (
    <section className="relative w-full overflow-hidden py-4" ref={containerRef}>
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        {/* Radial gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/90"></div>
        
        {/* Enhanced grid pattern with better visibility */}
        <div className="absolute inset-0 security-grid opacity-30"></div>
        
        {/* Animated security particles */}
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full security-particle"
              style={{
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                top: `${particle.top}%`,
                left: `${particle.left}%`,
                background: `rgba(var(--${['primary', 'secondary', 'accent'][particle.colorIndex]}-rgb), ${particle.opacity})`,
                boxShadow: `0 0 ${particle.blurRadius}px rgba(var(--${['primary', 'secondary', 'accent'][particle.colorIndex]}-rgb), 0.5)`
              }}
              animate={{
                y: [0, particle.yMove],
                x: [0, particle.xMove],
                opacity: [0, 0.7, 0],
                scale: [0, 1, 0.5]
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        {/* Hexagonal pattern overlay */}
        <div className="absolute inset-0 security-hexagon opacity-20"></div>
        
        {/* Animated shield pulse at center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div 
            className="absolute -inset-16 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.2) 0%, rgba(var(--primary-rgb), 0) 70%)' }}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.2, 0.3]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <motion.div 
          className="text-center mb-4"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.div
            className="inline-flex items-center justify-center mb-2"
            variants={itemVariants}
          >
            <div className="relative">
              <div className="bg-primary/20 p-3 rounded-full border border-primary/30">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-full border border-primary/30"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 0, 0.7]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </div>
          </motion.div>
          
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-2 tracking-tight"
            variants={itemVariants}
          >
            <span className="text-primary">{t('securityFeatures.title')}</span>
          </motion.h2>
          
          <motion.p
            className="text-base text-muted-foreground max-w-2xl mx-auto"
            variants={itemVariants}
          >
            {t('securityFeatures.subtitle')}
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-12 gap-4 items-start">
          {/* Security feature tabs */}
          <motion.div 
            className="md:col-span-4 space-y-2"
            variants={containerVariants}
            initial="hidden"
            animate={controls}
          >
            {securityFeatures.map((feature) => (
              <motion.div
                key={feature.id}
                className={`cursor-pointer transition-all duration-300 rounded-xl p-3 border ${
                  activeFeature === feature.id 
                    ? `${feature.bgColor} ${feature.borderColor} shadow-glow` 
                    : 'bg-card/60 border-border hover:bg-card'
                }`}
                onClick={() => setActiveFeature(feature.id)}
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-start">
                  <div className={`mr-3 p-2 rounded-lg ${
                    activeFeature === feature.id 
                      ? feature.bgColor
                      : 'bg-muted'
                  }`}>
                    <div className={activeFeature === feature.id ? feature.color : 'text-foreground'}>
                      {feature.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Feature visualization */}
          <motion.div 
            className="md:col-span-8"
            variants={containerVariants}
            initial="hidden"
            animate={controls}
          >
            <div className="backdrop-blur-sm bg-card/30 border border-border/50 rounded-xl p-4 shadow-xl">
              <AnimatePresence mode="wait">
                {activeFeature === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-bold flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-yellow-400" />
                      {t('securityFeatures.realTimeAlerts')}
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-3 mb-4">
                      <div className="notification-channel bg-gradient-to-br from-blue-500/20 to-blue-700/10 p-3 rounded-lg border border-blue-500/30">
                        <div className="flex items-center mb-1">
                          <MailIcon className="h-5 w-5 text-blue-400 mr-2" />
                          <h4 className="font-semibold">{t('securityFeatures.email.title')}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{t('securityFeatures.email.description')}</p>
                        <motion.div
                          className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500"
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [0.8, 1, 0.8]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        />
                      </div>
                      
                      <div className="notification-channel bg-gradient-to-br from-green-500/20 to-green-700/10 p-3 rounded-lg border border-green-500/30">
                        <div className="flex items-center mb-1">
                          <Smartphone className="h-5 w-5 text-green-400 mr-2" />
                          <h4 className="font-semibold">{t('securityFeatures.sms.title')}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{t('securityFeatures.sms.description')}</p>
                        <motion.div
                          className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500"
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [0.8, 1, 0.8]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: 0.7
                          }}
                        />
                      </div>
                      
                      <div className="notification-channel bg-gradient-to-br from-cyan-500/20 to-cyan-700/10 p-3 rounded-lg border border-cyan-500/30">
                        <div className="flex items-center mb-1">
                          <MessageSquare className="h-5 w-5 text-cyan-400 mr-2" />
                          <h4 className="font-semibold">{t('securityFeatures.telegram.title')}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{t('securityFeatures.telegram.description')}</p>
                        <motion.div
                          className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cyan-500"
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [0.8, 1, 0.8]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: 1.4
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="notification-demo border border-border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 border-b border-border px-3 py-1.5 flex items-center">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="text-sm font-medium">{t('securityFeatures.recentAlerts')}</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {notifications.map((notification, index) => (
                          <motion.div
                            key={notification.type}
                            className="notification-item flex items-start p-2 rounded-lg bg-card/50 border border-border"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                              notification.type === 'login' ? 'bg-blue-500/20 text-blue-500' :
                              notification.type === 'withdraw' ? 'bg-green-500/20 text-green-500' :
                              'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              {notification.icon}
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {notification.type === 'login' ? t('securityFeatures.loginAlert') :
                                 notification.type === 'withdraw' ? t('securityFeatures.withdrawalActivity') :
                                 t('securityFeatures.securityUpdate')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {notification.message}
                              </div>
                            </div>
                            <motion.div
                              className={`ml-auto h-2 w-2 rounded-full ${
                                notification.type === 'login' ? 'bg-blue-500' :
                                notification.type === 'withdraw' ? 'bg-green-500' :
                                'bg-yellow-500'
                              }`}
                              animate={{ 
                                scale: index === 0 ? [1, 1.5, 1] : 1,
                                opacity: index === 0 ? [0.8, 1, 0.8] : 1
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {activeFeature === 'twoFactor' && (
                  <motion.div
                    key="twoFactor"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-bold flex items-center">
                      <Smartphone className="h-5 w-5 mr-2 text-blue-400" />
                      {t('securityFeatures.twoFactorAuth')}
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg border border-border bg-muted/30">
                        <h4 className="font-semibold flex items-center mb-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                          </div>
                          {t('securityFeatures.loginProtection.title')}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {t('securityFeatures.loginProtection.description')}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-card/50">{t('securityFeatures.timeBasedOTP')}</Badge>
                          <Badge variant="outline" className="bg-card/50">{t('securityFeatures.smsVerification')}</Badge>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg border border-border bg-muted/30">
                        <h4 className="font-semibold flex items-center mb-2">
                          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </div>
                          {t('securityFeatures.withdrawalVerification.title')}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {t('securityFeatures.withdrawalVerification.description')}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-card/50">{t('securityFeatures.emailConfirmation')}</Badge>
                          <Badge variant="outline" className="bg-card/50">{t('securityFeatures.twoFARequired')}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 mt-3">
                      <div className="text-center">
                        <motion.div 
                          className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mx-auto mb-1"
                          whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(var(--primary-rgb), 0.3)' }}
                        >
                          <Image
                            src="/google-authenticator.png"
                            alt="Google Authenticator"
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                        </motion.div>
                        <span className="text-xs text-muted-foreground">{t('securityFeatures.googleAuthenticator')}</span>
                      </div>
                      
                      <div className="text-center">
                        <motion.div 
                          className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mx-auto mb-1"
                          whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(var(--primary-rgb), 0.3)' }}
                        >
                          <Image
                            src="/authy.png"
                            alt="Authy"
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                        </motion.div>
                        <span className="text-xs text-muted-foreground">{t('securityFeatures.authy')}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {activeFeature === 'encryption' && (
                  <motion.div
                    key="encryption"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-bold flex items-center">
                      <Database className="h-5 w-5 mr-2 text-emerald-400" />
                      {t('securityFeatures.militaryGradeDataProtection')}
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={`server-${i}`}
                          className="relative p-3 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-700/5 border border-emerald-500/30"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.2 }}
                        >
                          <div className="flex flex-col items-center">
                            <div className="relative">
                              <Database className="h-8 w-8 text-emerald-400" />
                              <motion.div
                                className="absolute -inset-1 rounded-md border border-emerald-400/50"
                                animate={{ 
                                  opacity: [0, 0.5, 0],
                                  scale: [1, 1.3, 1],
                                }}
                                transition={{ 
                                  duration: 3,
                                  repeat: Infinity,
                                  delay: i * 1
                                }}
                              />
                            </div>
                            <span className="font-medium mt-1 text-sm">{t('securityFeatures.server')} {i+1}</span>
                            <div className="flex items-center mt-0.5">
                              <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                              <span className="text-xs text-emerald-400">{t('securityFeatures.online')}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="p-3 rounded-lg border border-border bg-muted/30 mb-3">
                      <h4 className="font-semibold mb-2">{t('securityFeatures.enterpriseSecurity.title')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('securityFeatures.enterpriseSecurity.description')}
                      </p>
                      
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { id: 'aes256', desc: 'advancedEncryption' },
                          { id: 'tls13', desc: 'secureTransport' },
                          { id: 'sha512', desc: 'hashingAlgorithm' },
                          { id: 'ecdh', desc: 'keyExchange' }
                        ].map((item, i) => (
                          <motion.div
                            key={item.id}
                            className="text-center p-2 rounded-lg bg-card/50 border border-border"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            whileHover={{ y: -2, boxShadow: '0 5px 20px -5px rgba(0, 0, 0, 0.2)' }}
                          >
                            <div className="font-mono text-emerald-400 font-bold text-sm">{t(`securityFeatures.${item.id}`)}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{t(`securityFeatures.${item.desc}`)}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-center">
                      <div className="security-shield p-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, rotate: 360 }}
                          transition={{ 
                            type: "spring", 
                            damping: 10, 
                            stiffness: 100, 
                            delay: 0.5 
                          }}
                        >
                          <ShieldCheck className="h-10 w-10 text-emerald-400" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
        
        {/* Security badges */}
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="inline-flex flex-wrap justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
            <Badge variant="outline" className="bg-card/50 px-2 text-xs">
              <Lock className="h-3 w-3 mr-1" /> {t('securityFeatures.soc2')}
            </Badge>
            <Badge variant="outline" className="bg-card/50 px-2 text-xs">
              <EyeOff className="h-3 w-3 mr-1" /> {t('securityFeatures.gdpr')}
            </Badge>
            <Badge variant="outline" className="bg-card/50 px-2 text-xs">
              <ShieldCheck className="h-3 w-3 mr-1" /> {t('securityFeatures.pciDSS')}
            </Badge>
          </div>
        </motion.div>
      </div>
      
      {/* CSS for animations and effects */}
      <style jsx global>{`
        /* Enhanced security grid with better visibility */
        .security-grid {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px);
          animation: gridMove 30s linear infinite;
          transform: perspective(500px) rotateX(60deg);
          transform-origin: center top;
          height: 100%;
          opacity: 0.2;
        }
        
        /* Hexagonal security pattern */
        .security-hexagon {
          background-color: transparent;
          background-image: 
            repeating-linear-gradient(
              60deg, 
              rgba(var(--primary-rgb), 0.1), 
              rgba(var(--primary-rgb), 0.1) 1px, 
              transparent 1px, 
              transparent 30px
            ),
            repeating-linear-gradient(
              120deg, 
              rgba(var(--primary-rgb), 0.1), 
              rgba(var(--primary-rgb), 0.1) 1px, 
              transparent 1px, 
              transparent 30px
            );
          background-size: 70px 120px;
          animation: gridMove 40s linear infinite reverse;
        }
        
        /* Animated grid movement */
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 100px 100px; }
        }
        
        /* Notification channel styling */
        .notification-channel {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .notification-channel:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
        }
        
        /* Glow effect for active elements */
        .shadow-glow {
          box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.4);
        }
        
        /* Security particle animation */
        .security-particle {
          filter: blur(1px);
        }
        
        /* Security shield animation */
        .security-shield {
          position: relative;
        }
        
        .security-shield::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 9999px;
          background: linear-gradient(45deg, rgba(var(--primary-rgb), 0.5), rgba(var(--primary-rgb), 0));
          filter: blur(10px);
          opacity: 0.5;
          z-index: -1;
        }
      `}</style>
    </section>
  );
};

export default SecurityFeatures; 