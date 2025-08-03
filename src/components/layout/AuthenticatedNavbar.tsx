'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useNavigationItems, useCurrentPageLabel } from '@/utils/navigation';
import TokenBalance from '../ui/TokenBalance';

interface AuthenticatedNavbarProps {
  onLogout: () => void;
  onTokenClick?: () => void;
  userEmail?: string;
}

const AuthenticatedNavbar: React.FC<AuthenticatedNavbarProps> = ({
  onLogout,
  onTokenClick,
  userEmail
}) => {
  const handleLogout = () => {
    // Add confirmation for mobile logout to prevent accidents
    if (window.innerWidth <= 768) {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (!confirmed) return;
    }
    onLogout();
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shouldShowHamburger, setShouldShowHamburger] = useState(false);
  const router = useRouter();
  const navItems = useNavigationItems();
  const currentPageLabel = useCurrentPageLabel();

  // Check if we need to show hamburger menu based on available space
  useEffect(() => {
    const checkNavbarSpace = () => {
      const navbar = document.querySelector('.navbar-container');
      if (!navbar) return;

      const navbarWidth = navbar.clientWidth;
      const logoWidth = 200; // Approximate logo width
      const tokenBalanceWidth = 120; // Approximate token balance width
      const logoutWidth = 100; // Approximate logout button width
      const navItemWidth = 100; // Approximate width per nav item
      const hamburgerWidth = 50; // Hamburger button width
      const padding = 32; // Container padding

      const availableWidth = navbarWidth - logoWidth - tokenBalanceWidth - logoutWidth - padding;
      const requiredWidth = navItems.length * navItemWidth;
      
      setShouldShowHamburger(requiredWidth > availableWidth);
    };

    checkNavbarSpace();
    window.addEventListener('resize', checkNavbarSpace);
    return () => window.removeEventListener('resize', checkNavbarSpace);
  }, [navItems.length]);

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
    <nav className="bg-dark-lighter border-b border-dark-border relative z-10 sticky-header safe-area-top">
      <div className="container mx-auto px-4">
        <div className="navbar-container flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/images/favicon.svg"
              alt="AutoAuthor logo"
              className="h-6 w-6"
            />
            <motion.button 
              onClick={() => router.push('/')}
              className="font-display font-semibold text-gradient hover:opacity-90 transition-opacity touch-feedback"
              whileTap={{ scale: 0.95 }}
            >
              AutoAuthor.cc
            </motion.button>
          </div>

          {/* Desktop Navigation - Only show if we have space */}
          {!shouldShowHamburger && (
            <div className="hidden md:flex items-center space-x-6 flex-1 justify-center">
              {navItems.map((item) => (
                <motion.button
                  key={item.label}
                  onClick={item.onClick}
                  className="text-white/70 hover:text-white transition-colors cursor-pointer touch-feedback whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                </motion.button>
              ))}
              {currentPageLabel && (
                <span className="text-white border-b-2 border-primary whitespace-nowrap">
                  {currentPageLabel}
                </span>
              )}
            </div>
          )}

          {/* User Menu - Always visible */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Token Balance - Always visible */}
            <TokenBalance onClick={onTokenClick} className="shadow-elevation-1" />
            
            {/* Logout Button - Hidden on mobile when hamburger is shown, visible on desktop */}
            {!shouldShowHamburger && (
              <motion.button
                onClick={handleLogout}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors touch-feedback"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            )}

            {/* Hamburger Menu Button - Show when needed */}
            {shouldShowHamburger && (
              <motion.button
                className="text-white/70 hover:text-white touch-feedback p-2 ml-2"
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
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && shouldShowHamburger && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-2 space-y-2 bg-dark-lighter shadow-elevation-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.label}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    item.onClick();
                  }}
                  className="block transition-colors py-2 w-full text-left text-white/70 hover:text-white mobile-nav-item"
                  whileTap={{ scale: 0.98 }}
                >
                  {item.label}
                </motion.button>
              ))}
              {currentPageLabel && (
                <span className="block text-white font-medium py-2">{currentPageLabel}</span>
              )}
              <div className="pt-2 border-t border-dark-border">
                {userEmail && (
                  <span className="block text-white/70 py-2">{userEmail}</span>
                )}
                {/* Logout Button - Moved to bottom of mobile menu for safety */}
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors py-3 w-full text-left touch-feedback mt-2"
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default AuthenticatedNavbar;