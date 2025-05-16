"use client";

import React from 'react';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n/TranslationProvider';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  comment: string;
  rating: number;
}

export const Testimonials: React.FC = () => {
  const { t } = useTranslation();
  
  // Sample testimonials data
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "CFO",
      company: "TechVision Inc.",
      avatar: "/testimonials/avatar1.jpg",
      comment: "Mercy Coin has transformed how our company handles cryptocurrency transactions. The interface is intuitive and the security features are unmatched in the industry.",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Crypto Investor",
      company: "Chen Holdings",
      avatar: "/testimonials/avatar2.jpg",
      comment: "I've tried many crypto platforms, but Mercy Coin stands out with its low fees and lightning-fast transactions. Their customer support is exceptional too.",
      rating: 5
    },
    {
      id: 3,
      name: "Alex Rodriguez",
      role: "Tech Entrepreneur",
      company: "Future Labs",
      avatar: "/testimonials/avatar3.jpg",
      comment: "The multi-currency support and seamless exchange features make Mercy Coin my go-to platform for all crypto needs. Highly recommend!",
      rating: 4
    },
    {
      id: 4,
      name: "Emma Wilson",
      role: "Financial Analyst",
      company: "Global Investments",
      avatar: "/testimonials/avatar4.jpg",
      comment: "What impresses me most about Mercy Coin is how they've made crypto accessible to everyone. The learning resources and user-friendly design are perfect for beginners.",
      rating: 5
    }
  ];

  // Render star ratings
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <section className="w-full py-12 bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl font-bold mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t('testimonials.title') || "What Our Users Say"}
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('testimonials.subtitle') || "Discover why thousands of users trust Mercy Coin for their cryptocurrency needs"}
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full overflow-hidden border border-primary/10 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center mb-2">
                    <Quote className="text-primary h-8 w-8 opacity-50 mr-2" />
                    <div className="flex">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  
                  <p className="text-foreground/90 italic mb-6 leading-relaxed">
                    "{testimonial.comment}"
                  </p>
                  
                  <div className="flex items-center mt-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-primary/20">
                      <Image 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="flex justify-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
            <span className="text-primary font-medium">4.9</span>
            <div className="flex">
              {Array(5).fill(0).map((_, i) => (
                <Star 
                  key={i} 
                  className="h-4 w-4 text-primary fill-primary"
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-1">
              {t('testimonials.averageRating') || "from 500+ reviews"}
            </span>
          </div>
        </motion.div>
      </div>
      
      {/* Background blur elements */}
      <div className="absolute -z-10 top-1/3 left-0 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl opacity-50"></div>
      <div className="absolute -z-10 bottom-1/4 right-0 w-80 h-80 bg-primary/10 rounded-full filter blur-3xl opacity-50"></div>
    </section>
  );
};

export default Testimonials; 