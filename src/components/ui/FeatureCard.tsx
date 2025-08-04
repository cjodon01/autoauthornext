'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary/50 hover:shadow-glow transition-all duration-300 shadow-elevation-1"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.5,
            delay: delay
          }
        }
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 text-primary">
        {icon}
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      
      <p className="text-white/70 text-sm">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;