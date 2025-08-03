'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import HeroIllustration from '../ui/HeroIllustration';

interface HeroProps {
  openModal: () => void;
  scrollToHowItWorks: () => void;
}

const Hero: React.FC<HeroProps> = ({ openModal, scrollToHowItWorks }) => {
  const { session, loading } = useAuth();
  const router = useRouter();

  const handleMainAction = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      openModal();
    }
  };

  // Don't render anything while session is loading
  if (loading) {
    return (
      <section className="min-h-screen pt-28 pb-16 relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <motion.div 
            className="text-center max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Write Less. <span className="text-gradient">Publish More.</span> Grow Faster.
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Turn ideas into blogs, newsletters, emails, social media posts, and more. Publish in seconds, or set and forget it.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="w-32 h-12 bg-dark-border rounded-full animate-pulse"></div>
              <div className="w-40 h-12 bg-dark-border rounded-full animate-pulse"></div>
            </motion.div>
          </motion.div>
          
          <motion.div
            className="w-full max-w-5xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <HeroIllustration />
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-dark to-transparent"></div>
      </section>
    );
  }

  return (
    <section className="min-h-screen pt-28 pb-16 relative overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Write Less. <span className="text-gradient">Publish More.</span> Grow Faster.
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Turn ideas into blogs, newsletters, emails, social media posts, and more. Publish in seconds, or set and forget it.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <button 
              onClick={handleMainAction}
              className="btn btn-primary text-lg w-full sm:w-auto"
            >
              {session ? 'Go to Dashboard' : 'Start Creating'}
            </button>
            
            {!session && (
              <button 
                onClick={scrollToHowItWorks}
                className="btn btn-secondary text-lg w-full sm:w-auto"
              >
                See How It Works
              </button>
            )}
          </motion.div>
        </motion.div>
        
        <motion.div
          className="w-full max-w-5xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <HeroIllustration />
        </motion.div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-dark to-transparent"></div>
    </section>
  );
};

export default Hero;