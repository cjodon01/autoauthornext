'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Zap } from 'lucide-react';

interface AddTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTokensModal: React.FC<AddTokensModalProps> = ({ isOpen, onClose }) => {
  const tokenPackages = [
    {
      tokens: 1000,
      price: 5,
      popular: false,
      savings: null,
    },
    {
      tokens: 6000,
      price: 25,
      popular: true,
      savings: '20%',
    },
    {
      tokens: 15000,
      price: 50,
      popular: false,
      savings: '33%',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative bg-dark-card border border-dark-border rounded-2xl w-full max-w-md overflow-hidden z-10"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <button
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
              onClick={onClose}
            >
              <X size={20} />
            </button>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Add Tokens</h2>
                <p className="text-white/60">
                  Purchase tokens to power your AI content generation
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                {tokenPackages.map((pkg, index) => (
                  <div
                    key={index}
                    className={`relative p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                      pkg.popular
                        ? 'border-primary bg-primary/5'
                        : 'border-dark-border bg-dark-lighter hover:border-primary/30'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            {pkg.tokens.toLocaleString()} tokens
                          </span>
                          {pkg.savings && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                              Save {pkg.savings}
                            </span>
                          )}
                        </div>
                        <p className="text-white/60 text-sm">
                          Perfect for {pkg.tokens < 2000 ? 'testing' : pkg.tokens < 10000 ? 'regular use' : 'power users'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${pkg.price}</div>
                        <div className="text-white/40 text-xs">
                          ${(pkg.price / pkg.tokens * 1000).toFixed(2)}/1K tokens
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full btn btn-primary flex items-center justify-center gap-2">
                <CreditCard className="h-4 w-4" />
                Continue to Payment
              </button>
              
              <p className="text-center text-white/40 text-xs mt-4">
                Secure payment powered by Stripe
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddTokensModal;