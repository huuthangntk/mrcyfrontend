"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Zap className="h-12 w-12 text-primary" />,
      title: 'Fast Transactions',
      description: 'Experience lightning-fast transactions with our optimized blockchain integration. Transfer assets instantly, no matter where you are.'
    },
    {
      icon: <ShieldCheck className="h-12 w-12 text-primary" />,
      title: 'Enhanced Security',
      description: 'Your assets are protected by military-grade encryption and multi-layer security protocols. We implement the latest security standards to keep your funds safe.'
    },
    {
      icon: <Users className="h-12 w-12 text-primary" />,
      title: '24/7 Support',
      description: 'Our dedicated team is available around the clock to assist you with any questions or concerns. Get help when you need it, no matter the time.'
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
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Why Choose Mercy</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform is designed with your needs in mind, offering a seamless and secure experience for all your cryptocurrency transactions.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="bg-card border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              variants={itemVariants}
            >
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">{feature.title}</h3>
              <p className="text-muted-foreground text-center">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button size="lg" className="px-8">
            Start Your Journey
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection; 