"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n/TranslationProvider';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define interface for crypto data
interface CryptoPrice {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, CryptoPrice>>({});
  const [isMobile, setIsMobile] = useState(false);
  
  // Animation states
  const [animationState, setAnimationState] = useState<'idle' | 'drawing' | 'erasing'>('idle');
  
  // Refs
  const mainCoinRef = useRef<HTMLDivElement>(null);
  const coinRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const animationStartTimeRef = useRef<number>(0);
  
  // List of cryptocurrencies
  const supportedCoins = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: '/crypto/BTC.png' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: '/crypto/ETH.png' },
    { id: 'binancecoin', name: 'Binance Coin', symbol: 'BNB', icon: '/crypto/BNB.png' },
    { id: 'tron', name: 'Tron', symbol: 'TRX', icon: '/crypto/TRX.png' },
    { id: 'toncoin', name: 'Ton Coin', symbol: 'TON', icon: '/crypto/TON.png' },
    { id: 'solana', name: 'Solana', symbol: 'SOL', icon: '/crypto/SOL.png' },
    { id: 'polygon', name: 'Polygon', symbol: 'POL', icon: '/crypto/POL.png' },
    { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', icon: '/crypto/LTC.png' },
    { id: 'usd-coin', name: 'USDC', symbol: 'USDC', icon: '/crypto/USDC.png' },
    { id: 'tether', name: 'Tether', symbol: 'USDT', icon: '/crypto/tether.png' },
    { id: 'bitcoin-cash', name: 'Bitcoin Cash', symbol: 'BCH', icon: '/crypto/BCH.png' },
  ];

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
      
      // For mobile, always show lines
      if (isMobileDevice && animationState === 'idle') {
        setAnimationState('drawing');
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add listener for resize events
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [animationState]);

  // Fetch cryptocurrency prices
  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${supportedCoins.map(coin => coin.id).join(',')}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch cryptocurrency data');
        }
        
        const data = await response.json();
        
        // Create a map of id to price data
        const pricesMap: Record<string, CryptoPrice> = {};
        data.forEach((coin: any) => {
          pricesMap[coin.id] = {
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            current_price: coin.current_price,
            price_change_percentage_24h: coin.price_change_percentage_24h || 0,
          };
        });
        
        setCryptoPrices(pricesMap);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    };

    fetchCryptoPrices();
    
    // Refresh prices every 60 seconds
    const interval = setInterval(fetchCryptoPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Format price with appropriate decimals
  const formatPrice = (price: number) => {
    if (price < 1) {
      return price.toFixed(6);
    } else if (price < 100) {
      return price.toFixed(2);
    } else {
      return price.toFixed(0);
    }
  };

  // Mouse event handlers for main coin
  const handleMainCoinMouseEnter = () => {
    if (!isMobile) {
      setAnimationState('drawing');
      animationStartTimeRef.current = Date.now();
    }
  };

  const handleMainCoinMouseLeave = () => {
    if (!isMobile) {
      setAnimationState('erasing');
      animationStartTimeRef.current = Date.now();
    }
  };

  // Draw connecting lines between main coin and surrounding coins
  useEffect(() => {
    if (!mainCoinRef.current || !canvasRef.current || animationState === 'idle') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match its displayed size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get the actual RGB values from CSS variable
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryRgb = computedStyle.getPropertyValue('--primary-rgb').trim() || '14, 165, 233';

    // Get main coin position (center of the element)
    const mainCoinRect = mainCoinRef.current.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    const mainCoinX = mainCoinRect.left + mainCoinRect.width / 2 - canvasRect.left;
    const mainCoinY = mainCoinRect.top + mainCoinRect.height / 2 - canvasRect.top;

    // Animation variables
    const DRAWING_DURATION = 400; // ms - faster drawing
    const ERASING_DURATION = 500; // ms - faster erasing
    const animationDuration = animationState === 'drawing' ? DRAWING_DURATION : ERASING_DURATION;

    // Function to animate drawing of lines
    const animateConnections = (timestamp: number) => {
      // Clear canvas for redrawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate animation progress (0 to 1)
      const elapsed = Date.now() - animationStartTimeRef.current;
      let progress = Math.min(1, elapsed / animationDuration);
      
      // Reverse the progress for erasing animation
      if (animationState === 'erasing') {
        progress = 1 - progress;
      }
      
      // Set base opacity based on progress and animation state
      const baseOpacity = isMobile ? 1 : progress;
      
      // Draw lines to each coin simultaneously
      Object.entries(coinRefs.current).forEach(([id, coinRef]) => {
        if (!coinRef) return;
        
        const coinRect = coinRef.getBoundingClientRect();
        const coinX = coinRect.left + coinRect.width / 2 - canvasRect.left;
        const coinY = coinRect.top + coinRect.height / 2 - canvasRect.top;
        
        // Calculate points along the line based on progress
        const currentX = mainCoinX + (coinX - mainCoinX) * progress;
        const currentY = mainCoinY + (coinY - mainCoinY) * progress;

        // Create gradient for the line
        if (isFinite(mainCoinX) && isFinite(mainCoinY) && isFinite(currentX) && isFinite(currentY)) {
          const gradient = ctx.createLinearGradient(
            mainCoinX, mainCoinY, currentX, currentY
          );
          
          gradient.addColorStop(0, `rgba(${primaryRgb}, ${0.9 * baseOpacity})`);
          gradient.addColorStop(1, `rgba(${primaryRgb}, ${0.3 * baseOpacity})`);
          
          ctx.strokeStyle = gradient;
        } else {
          // Fallback to solid color if coordinates are invalid
          ctx.strokeStyle = `rgba(${primaryRgb}, ${0.5 * baseOpacity})`;
        }

        // Draw line with animation
        ctx.beginPath();
        ctx.moveTo(mainCoinX, mainCoinY);
        ctx.lineTo(currentX, currentY);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw pulsing endpoints when progress is almost complete
        if (progress >= 0.95) {
          // Draw pulsing circle at the coin endpoint
          ctx.beginPath();
          ctx.arc(coinX, coinY, 4 + Math.sin(Date.now() / 200) * 2, 0, 2 * Math.PI);
          ctx.fillStyle = `rgba(${primaryRgb}, ${0.8 * baseOpacity})`;
          ctx.fill();
        }
      });

      // Draw glowing circle around main coin
      ctx.beginPath();
      ctx.arc(mainCoinX, mainCoinY, 85, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(${primaryRgb}, ${0.3 * baseOpacity})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Outer glow pulse
      const pulseSize = 90 + Math.sin(Date.now() / 300) * 5;
      ctx.beginPath();
      ctx.arc(mainCoinX, mainCoinY, pulseSize, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(${primaryRgb}, ${0.2 * baseOpacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Check if animation is complete
      if (animationState === 'erasing' && progress <= 0.01) {
        setAnimationState('idle');
        cancelAnimationFrame(animationRef.current!);
        animationRef.current = null;
        // Clear canvas completely when done erasing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // Continue animation
      animationRef.current = requestAnimationFrame(animateConnections);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animateConnections);
    
    // Cleanup function to cancel animation frame
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
    
  }, [animationState, isMobile]); 

  // Randomize floating shapes positions on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shapes = document.querySelectorAll('.floating-shape');
      
      shapes.forEach((shape) => {
        const top = `${Math.random() * 70 + 10}%`;
        const left = `${Math.random() * 80 + 10}%`;
        
        shape.setAttribute('style', `
          top: ${top};
          left: ${left};
          animation-delay: ${Math.random() * 5}s;
          animation-duration: ${8 + Math.random() * 4}s;
        `);
      });
    }
  }, []);

  return (
    <section className="relative pt-12 w-full overflow-hidden bg-gradient-to-b from-background/90 to-background py-6 md:py-10">
      {/* Connection lines canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-[1] w-full h-full pointer-events-none"
      />

      {/* Background animated elements */}
      <div className="absolute inset-0 z-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-background to-background"></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
        
        {/* Subtle hexagon pattern */}
        <div className="absolute inset-0 hexagon-pattern opacity-5"></div>
        
        {/* Animated floating elements */}
        <div className="absolute inset-0">
          {Array.from({ length: 6 }).map((_, index) => (
            <div 
              key={index}
              className={`absolute floating-shape shape-${index % 3} opacity-20`}
              style={{
                // Use fixed positions for server rendering
                top: `${15 + (index * 10)}%`,
                left: `${20 + (index * 10)}%`,
                animationDelay: `${index * 0.5}s`,
                animationDuration: `${8 + index * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Center all content in a more compact layout */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Move Mercy coin to the top */}
          <motion.div
            className="relative w-full h-[220px] sm:h-[240px] md:h-[300px] mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Main Mercy coin logo - floating with subtle animations */}
            <motion.div
              ref={mainCoinRef}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 p-5 rounded-full bg-gradient-to-br from-primary/20 to-background border border-primary/30 glow-effect cursor-pointer"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              onMouseEnter={handleMainCoinMouseEnter}
              onMouseLeave={handleMainCoinMouseLeave}
            >
              <Image
                src="/mercy-coin.png"
                alt="Mercy Coin"
                width={160}
                height={160}
                className="object-contain"
              />
            </motion.div>

            {/* Floating cards with crypto logos in circular arrangement */}
            <TooltipProvider delayDuration={100}>
              <div className="cards-container">
                {supportedCoins.slice(0, 8).map((coin, index) => {
                  const priceData = cryptoPrices[coin.id];
                  return (
                    <Tooltip key={coin.id}>
                      <TooltipTrigger asChild>
                        <motion.div
                          ref={(el: HTMLDivElement | null) => { coinRefs.current[coin.id] = el; }}
                          className="floating-card"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ 
                            scale: 1.15, 
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 8px rgba(var(--primary-rgb), 0.4)',
                            borderColor: 'rgba(var(--primary-rgb), 0.5)' 
                          }}
                          transition={{ 
                            duration: 0.5, 
                            delay: 0.2 + index * 0.1,
                          }}
                          style={{
                            '--index': index,
                          } as React.CSSProperties}
                        >
                          <Image
                            src={coin.icon}
                            alt={coin.name}
                            width={32}
                            height={32}
                            className="object-contain enhanced-pulse-animation"
                          />
                          <div className="text-xs font-medium mt-1">{coin.symbol}</div>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        className="crypto-tooltip" 
                        sideOffset={5}
                        avoidCollisions={true}
                      >
                        {priceData ? (
                          <div className="p-3 min-w-[150px]">
                            <div className="font-bold text-base mb-1">{priceData.name}</div>
                            <div className="text-2xl font-bold text-primary">${formatPrice(priceData.current_price)}</div>
                            <div className={`text-sm flex items-center gap-1 mt-2 ${
                              priceData.price_change_percentage_24h >= 0 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            }`}>
                              <span className={`${priceData.price_change_percentage_24h >= 0 ? 'rotate-0' : 'rotate-180'} inline-block mr-1`}>
                                ↑
                              </span>
                              {priceData.price_change_percentage_24h >= 0 ? '+' : ''}
                              {priceData.price_change_percentage_24h.toFixed(2)}% 
                              <span className="text-xs opacity-70">(24h)</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Last updated: {new Date().toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                            <span>Loading price...</span>
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>

            {/* Animated particles */}
            <div className="particles-container">
              {Array.from({ length: 15 }).map((_, index) => (
                <div 
                  key={index}
                  className="particle"
                  style={{
                    '--index': index,
                    '--total': 15,
                  } as React.CSSProperties}
                ></div>
              ))}
            </div>
          </motion.div>

          {/* Text content - centered */}
          <motion.div
            className="flex flex-col space-y-4 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              <span className="text-primary">{t('hero.title')}</span>
              <div className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">{t('hero.subtitle')}</div>
            </h1>

            <p className="text-lg text-muted-foreground max-w-md">
              {t('hero.description')}
            </p>

            <motion.div
              className="flex flex-wrap gap-4 pt-3 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button size="lg" className="px-8">
                {t('common.getStarted')}
              </Button>
              <Button size="lg" variant="outline" className="px-8">
                {t('common.learnMore')}
              </Button>
            </motion.div>
            
            {/* Cryptocurrency icons in a row at bottom */}
            <motion.div 
              className="flex flex-wrap gap-2 pt-5 items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <span className="text-sm text-muted-foreground mr-1">{t('common.supports')}</span>
              {supportedCoins.map((coin, index) => (
                <motion.div
                  key={coin.id}
                  className="crypto-coin-badge"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                >
                  <Image
                    src={coin.icon}
                    alt={coin.name}
                    width={16}
                    height={16}
                    className="inline-block mr-1"
                  />
                  <span className="text-xs font-medium">{coin.symbol}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        /* Grid pattern background with subtle animation */
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(var(--primary-rgb), 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--primary-rgb), 0.05) 1px, transparent 1px);
          background-size: 30px 30px;
          animation: patternMove 30s linear infinite;
        }
        
        /* Hexagon pattern with subtle animation */
        .hexagon-pattern {
          background-color: transparent;
          background-image: 
            repeating-linear-gradient(
              60deg, 
              rgba(var(--primary-rgb), 0.03), 
              rgba(var(--primary-rgb), 0.03) 1px, 
              transparent 1px, 
              transparent 30px
            ),
            repeating-linear-gradient(
              120deg, 
              rgba(var(--primary-rgb), 0.03), 
              rgba(var(--primary-rgb), 0.03) 1px, 
              transparent 1px, 
              transparent 30px
            );
          background-size: 70px 120px;
          animation: patternMove 40s linear infinite reverse;
        }
        
        @keyframes patternMove {
          0% { background-position: 0 0; }
          100% { background-position: 100px 100px; }
        }
        
        /* Enhanced pulse animation for coin icons */
        .enhanced-pulse-animation {
          animation: enhancedPulse 3s ease-in-out infinite;
          animation-delay: calc(var(--index) * 0.5s);
          filter: drop-shadow(0 0 5px rgba(var(--primary-rgb), 0.5));
        }
        
        @keyframes enhancedPulse {
          0% { opacity: 1; transform: scale(1); filter: brightness(1.3); }
          50% { opacity: 0.1; transform: scale(0.8); filter: brightness(0.7); }
          100% { opacity: 1; transform: scale(1); filter: brightness(1.3); }
        }
        
        /* Floating shapes */
        .floating-shape {
          width: 60px;
          height: 60px;
          border-radius: 20%;
          filter: blur(20px);
          transform-origin: center;
          animation: float 10s ease-in-out infinite alternate;
        }
        
        .shape-0 {
          background: radial-gradient(circle, rgba(var(--primary-rgb), 0.3), transparent 70%);
        }
        
        .shape-1 {
          background: radial-gradient(circle, rgba(var(--secondary-rgb), 0.3), transparent 70%);
        }
        
        .shape-2 {
          background: radial-gradient(circle, rgba(var(--accent-rgb), 0.3), transparent 70%);
        }
        
        @keyframes float {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          50% {
            transform: translate(20px, -20px) rotate(10deg) scale(1.2);
          }
          100% {
            transform: translate(-15px, 15px) rotate(-10deg) scale(0.8);
          }
        }
        
        /* Glow effect */
        .glow-effect {
          box-shadow: 0 0 40px 5px rgba(var(--primary-rgb), 0.4);
        }
        
        /* Cryptocurrency badges */
        .crypto-coin-badge {
          display: flex;
          align-items: center;
          padding: 3px 6px;
          background-color: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 9999px;
          transition: all 0.2s;
        }
        
        .crypto-coin-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          background-color: hsl(var(--primary) / 0.1);
          border-color: hsl(var(--primary) / 0.2);
        }
        
        /* Floating cards animation */
        .cards-container {
          position: absolute;
          width: 100%;
          height: 100%;
          perspective: 800px;
        }
        
        .floating-card {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 70px;
          height: 70px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          animation: floatingCard 10s ease-in-out infinite;
          animation-delay: calc(var(--index) * 0.5s);
          cursor: pointer;
          z-index: 5;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        
        /* Mobile styles for floating cards */
        @media (max-width: 768px) {
          .floating-card {
            width: 50px;
            height: 50px;
            border-radius: 10px;
          }
          
          .floating-card .text-xs {
            font-size: 0.65rem;
          }
          
          .floating-card img {
            width: 24px;
            height: 24px;
          }
        }
        
        /* Tooltip styling */
        .crypto-tooltip {
          background-color: hsl(var(--card));
          border: 1px solid rgba(var(--primary-rgb), 0.4);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2), 0 0 15px rgba(var(--primary-rgb), 0.3);
          animation: tooltipAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 100;
          max-width: none !important;
          transform-origin: center bottom;
        }
        
        @keyframes tooltipAppear {
          from { opacity: 0; transform: scale(0.8) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        /* Desktop positioning (8 coins with wider separation) */
        @media (min-width: 769px) {
          .floating-card:nth-child(1) {
            top: 10%;
            left: 10%;
          }
          
          .floating-card:nth-child(2) {
            top: 65%;
            left: 15%;
          }
          
          .floating-card:nth-child(3) {
            top: 30%;
            left: 18%;
          }
          
          .floating-card:nth-child(4) {
            /* TON coin - move to top left of mercy coin */
            top: -8%;
            left: 35%;
          }
          
          .floating-card:nth-child(5) {
            /* Move from bottom to top right of mercy coin */
            top: -8%;
            right: 35%;
          }
          
          .floating-card:nth-child(6) {
            top: 30%;
            right: 18%;
          }
          
          .floating-card:nth-child(7) {
            top: 65%; 
            right: 15%;
          }
          
          .floating-card:nth-child(8) {
            top: 10%;
            right: 10%;
          }
        }
        
        /* Mobile positioning (8 coins scattered around edges) */
        @media (max-width: 768px) {
          .floating-card:nth-child(1) {
            top: 0%;
            left: 8%;
          }
          
          .floating-card:nth-child(2) {
            top: 20%;
            left: 2%;
          }
          
          .floating-card:nth-child(3) {
            top: 0%;
            right: 8%;
          }
          
          .floating-card:nth-child(4) {
            /* TON coin - move to top left of mercy coin */
            top: -15%;
            left: 35%;
          }
          
          .floating-card:nth-child(5) {
            /* Move to top right of mercy coin */
            top: -15%;
            right: 35%;
          }
          
          .floating-card:nth-child(6) {
            top: 40%;
            right: 2%;
          }
          
          .floating-card:nth-child(7) {
            top: 40%;
            left: 2%;
          }
          
          .floating-card:nth-child(8) {
            top: 60%;
            right: 2%;
          }
        }
        
        @keyframes floatingCard {
          0%, 100% {
            transform: translateY(0) translateX(0) rotateX(0deg) rotateY(0deg);
          }
          25% {
            transform: translateY(-10px) translateX(5px) rotateX(5deg) rotateY(5deg);
          }
          50% {
            transform: translateY(5px) translateX(-5px) rotateX(-5deg) rotateY(-5deg);
          }
          75% {
            transform: translateY(8px) translateX(10px) rotateX(5deg) rotateY(-5deg);
          }
        }
        
        /* Particles animation */
        .particles-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background-color: hsl(var(--primary));
          border-radius: 50%;
          opacity: 0.3;
          animation: particle-float 6s linear infinite;
          animation-delay: calc(var(--index) * (6s / var(--total)));
          top: calc(50% + (var(--index) % 5) * 15px - 30px);
          left: calc(50% + ((var(--index) + 2) % 5) * 15px - 30px);
        }
        
        @keyframes particle-float {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          20% {
            transform: translate(var(--tr-x, 40px), var(--tr-y, 40px)) scale(1);
            opacity: 0.5;
          }
          80% {
            transform: translate(var(--tr-x2, 80px), var(--tr-y2, 80px)) scale(1);
            opacity: 0.5;
          }
          100% {
            transform: translate(var(--tr-x3, 120px), var(--tr-y3, 120px)) scale(0);
            opacity: 0;
          }
        }
        
        .particle:nth-child(odd) {
          --tr-x: -40px;
          --tr-y: -60px;
          --tr-x2: -80px;
          --tr-y2: -100px;
          --tr-x3: -120px;
          --tr-y3: -140px;
        }
        
        .particle:nth-child(3n) {
          --tr-x: 60px;
          --tr-y: -30px;
          --tr-x2: 100px;
          --tr-y2: -60px;
          --tr-x3: 140px;
          --tr-y3: -90px;
        }
        
        .particle:nth-child(3n+1) {
          --tr-x: -60px;
          --tr-y: 30px;
          --tr-x2: -100px;
          --tr-y2: 60px;
          --tr-x3: -140px;
          --tr-y3: 90px;
        }
        
        .particle:nth-child(5n) {
          --tr-x: 90px;
          --tr-y: 60px;
          --tr-x2: 60px;
          --tr-y2: 90px;
          --tr-x3: 30px;
          --tr-y3: 120px;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;