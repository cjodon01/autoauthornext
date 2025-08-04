'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StepCardProps {
  number: number;
  icon: ReactNode;
  title: string | ReactNode;
  description: string;
  isLast?: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ number, icon, title, description, isLast = false }) => {
  return (
    <motion.div
      className="relative flex flex-col items-center text-center md:w-1/3"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
      }}
    >
      <motion.div
        className="w-16 h-16 rounded-full bg-dark-card border border-dark-border flex items-center justify-center mb-6 relative z-10 shadow-elevation-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-sm"></div>
        <div className="relative bg-dark-lighter rounded-full w-14 h-14 flex items-center justify-center">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-elevation-1">
          {number}
        </div>
      </motion.div>
      
      {!isLast && (
        <div className="hidden md:block absolute top-8 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-[2px] bg-gradient-to-r from-primary/30 to-secondary/30"></div>
      )}
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      
      <p className="text-white/70 max-w-xs">{description}</p>
    </motion.div>
  );
};

export default StepCard;