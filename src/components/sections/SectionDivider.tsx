'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SectionDividerProps {
  variant?: 'default' | 'reverse';
}

const SectionDivider: React.FC<SectionDividerProps> = ({ variant = 'default' }) => {
  return (
    <div className="relative h-24 overflow-hidden">
      <motion.div
        className={`absolute inset-0 ${
          variant === 'reverse' ? 'bg-dark-lighter' : 'bg-dark'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <svg
          className="absolute bottom-0 left-0 w-full h-24"
          viewBox="0 0 1440 74"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 24L48 29.3C96 34.7 192 45.3 288 40C384 34.7 480 13.3 576 8C672 2.7 768 13.3 864 24C960 34.7 1056 45.3 1152 45.3C1248 45.3 1344 34.7 1392 29.3L1440 24V74H1392C1344 74 1248 74 1152 74C1056 74 960 74 864 74C768 74 672 74 576 74C480 74 384 74 288 74C192 74 96 74 48 74H0V24Z"
            fill={variant === 'reverse' ? '#121212' : '#1A1A1A'}
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute inset-0 opacity-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.2, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[80px] rounded-full blur-[100px] bg-gradient-to-r from-primary via-secondary to-accent"></div>
      </motion.div>
    </div>
  );
};

export default SectionDivider;