'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import PricingModal from '../modals/PricingModal';

interface HeaderProps {
  openModal: () => void;
  session?: { user: { email?: string } } | null;
}

const Header: React.FC<HeaderProps> = ({ openModal, session }) => {
  const [scrolled, setScrolled] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAction = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      openModal();
    }
  };

  // Variants for the hamburger menu animation
  const lineVariants = {
    closed: { rotate: 0, y: 0 },
    open: (i: number) => {
      const variants = [
        { rotate: 45, y: 6 },    // top line
        { opacity: 0 },          // middle line
        { rotate: -45, y: -6 }   // bottom line
      ];
      return variants[i];
    }
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-dark/90 backdrop-blur-md py-4' : 'bg-transparent py-6'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 touch-feedback" aria-label="Home">
            <img
              src="/images/favicon.svg"
              alt="AutoAuthor logo"
              className="h-6 w-6"
            />
            <span className="text-xl font-display font-semibold">AutoAuthor.cc</span>
          </Link>
          
          {/* Hamburger Menu Button (mobile only) */}
          <motion.button
            className="lg:hidden text-white/70 hover:text-white touch-feedback p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-6 h-0.5 bg-white mb-1.5 last:mb-0 block rounded-full"
                  initial="closed"
                  animate={isMenuOpen ? "open" : "closed"}
                  variants={lineVariants}
                  custom={i}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <a
              href="#features"
              className="text-white/70 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-white/70 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <button
              onClick={() => setShowPricing(true)}
              className="text-white/70 hover:text-white transition-colors"
            >
              Pricing
            </button>
            <motion.button
              onClick={handleAction}
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {session ? 'Dashboard' : 'Get Started'}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="lg:hidden px-4 py-2 space-y-2 bg-dark-lighter shadow-elevation-2">
                {session && (
                  <motion.button
                    onClick={() => {
                      setIsMenuOpen(false);
                      router.push('/dashboard');
                    }}
                    className="block transition-colors py-2 w-full text-left text-white/90 hover:text-white mobile-nav-item font-medium"
                    whileTap={{ scale: 0.98 }}
                  >
                    Dashboard 
                  </motion.button>
                )}
                <motion.a
                  href="#features"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-white/70 hover:text-white transition-colors py-2 mobile-nav-item"
                  whileTap={{ scale: 0.98 }}
                >
                  Features
                </motion.a>
                <motion.a
                  href="#how-it-works"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-white/70 hover:text-white transition-colors py-2 mobile-nav-item"
                  whileTap={{ scale: 0.98 }}
                >
                  How It Works
                </motion.a>
                <motion.button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowPricing(true);
                  }}
                  className="block text-white/70 hover:text-white transition-colors py-2 w-full text-left mobile-nav-item"
                  whileTap={{ scale: 0.98 }}
                >
                  Pricing
                </motion.button>
                {!session && (
                  <motion.button
                    onClick={() => {
                      setIsMenuOpen(false);
                      openModal();
                    }}
                    className="block transition-colors py-2 w-full text-left text-primary hover:text-primary-light mobile-nav-item font-medium"
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <PricingModal 
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        openLoginModal={openModal}
      />
    </>
  );
};

export default Header;