'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  openLoginModal: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  openLoginModal
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative bg-dark-lighter border border-dark-border rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold text-white">Pricing</h2>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Token-Based Pricing</h3>
                <p className="text-white/70 mb-4">Pay only for what you use</p>
              </div>
              
              <div className="bg-dark border border-dark-border rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">$5</div>
                  <div className="text-white/70 mb-2">1,000 Tokens</div>
                  <p className="text-sm text-white/60">Perfect for testing and small projects</p>
                </div>
              </div>
              
              <div className="bg-dark border border-primary/20 rounded-lg p-4 relative">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">Popular</span>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">$25</div>
                  <div className="text-white/70 mb-2">6,000 Tokens</div>
                  <p className="text-sm text-white/60">Best value for regular content creation</p>
                </div>
              </div>
              
              <div className="bg-dark border border-dark-border rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">$50</div>
                  <div className="text-white/70 mb-2">15,000 Tokens</div>
                  <p className="text-sm text-white/60">For power users and agencies</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  onClose();
                  openLoginModal();
                }}
                className="w-full btn btn-primary mt-6"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PricingModal;