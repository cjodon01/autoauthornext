'use client';

import React from 'react';
import { motion } from 'framer-motion';

const HeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full aspect-[16/9] max-w-4xl mx-auto">
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] rounded-full blur-[100px] bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30"></div>
      
      {/* Main container */}
      <motion.div 
        className="relative bg-dark-card rounded-2xl border border-dark-border shadow-xl overflow-hidden z-10 w-full h-full"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        {/* Header bar */}
        <div className="h-12 bg-dark-lighter flex items-center px-4 border-b border-dark-border">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <div className="w-3 h-3 rounded-full bg-primary"></div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-dark-border rounded-full px-4 py-1 text-xs text-white/60">autoauthor.cc</div>
          </div>
        </div>
        
        {/* Content area */}
        <div className="p-6 flex flex-col h-[calc(100%-3rem)]">
          {/* Animation of typing text */}
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="bg-dark rounded-lg p-4 mb-4">
              <div className="text-white/60 text-sm mb-2">Write a blog post about:</div>
              <div className="text-white font-medium">The Future of AI in Content Creation</div>
            </div>
            
            <motion.div 
              className="bg-dark-lighter rounded-lg p-4 border border-primary/20 shadow-glow"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <div className="flex items-center mb-3">
                <div className="h-4 w-4 rounded-full bg-primary mr-2"></div>
                <div className="text-white/80 text-sm">AutoAuthor is writing...</div>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, staggerChildren: 0.1 }}
              >
                <motion.h1 
                  className="text-white text-xl font-semibold mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.2 }}
                >
                  The Future of AI in Content Creation: Revolutionizing How We Write
                </motion.h1>
                
                <motion.p 
                  className="text-white/80 text-sm mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                >
                  In today&apos;s fast-paced digital landscape, content creators face unprecedented demands...
                </motion.p>
                
                <motion.p 
                  className="text-white/80 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.8 }}
                >
                  Artificial intelligence is transforming the way we approach content creation, offering...
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Controls and formatting options */}
          <motion.div 
            className="mt-auto flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
          >
            <div className="flex space-x-2">
              <button className="bg-dark-border rounded-md p-2 text-white/60 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button className="bg-dark-border rounded-md p-2 text-white/60 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
              </button>
            </div>
            
            <div>
              <button className="bg-primary text-white rounded-md px-3 py-1 text-sm hover:bg-primary-light transition-colors">
                Publish
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Floating elements */}
      <motion.div 
        className="absolute -top-8 -right-8 bg-dark-card p-3 rounded-lg border border-dark-border shadow-lg z-20"
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 2, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div>
            <div className="text-white text-xs font-medium">Blog Post</div>
            <div className="text-white/60 text-xs">SEO Optimized</div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="absolute bottom-12 -left-6 bg-dark-card p-3 rounded-lg border border-dark-border shadow-lg z-20"
        animate={{ 
          y: [0, 10, 0],
          rotate: [0, -2, 0]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div>
            <div className="text-white text-xs font-medium">Auto-Schedule</div>
            <div className="text-white/60 text-xs">Every Tuesday</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroIllustration;