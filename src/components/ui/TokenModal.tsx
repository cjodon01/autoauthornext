import React, { useState, useEffect } from 'react';
import { Plus, Bolt, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTokenBalance } from '../../hooks/useTokenBalance';
import AddTokensModal from '../modals/AddTokensModal';
import { motion, AnimatePresence } from 'framer-motion';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  wasCheckoutSuccess?: boolean;
}

const TokenModal: React.FC<TokenModalProps> = ({ isOpen, onClose, wasCheckoutSuccess = false }) => {
  const { tokenBalance, loading } = useTokenBalance();
  const router = useRouter();
  const [showAddTokensModal, setShowAddTokensModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Trigger success animation when wasCheckoutSuccess is true
  useEffect(() => {
    if (wasCheckoutSuccess && isOpen) {
      setShowSuccessAnimation(true);
      const timer = setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [wasCheckoutSuccess, isOpen]);

  if (!isOpen && !showAddTokensModal) return null;

  const handleAddTokens = () => {
    onClose(); // Close the token balance modal first
    setShowAddTokensModal(true); // Then open the add tokens modal
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 safe-area-bottom">
            <motion.div
              className="bg-dark-card rounded-xl border border-dark-border p-6 w-80 shadow-elevation-3 relative"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.3, type: "spring", damping: 20, stiffness: 300 }}
            >
              {/* Success Animation Overlay */}
              <AnimatePresence>
                {showSuccessAnimation && (
                  <motion.div
                    className="absolute inset-0 bg-green-500/20 rounded-xl flex items-center justify-center z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="bg-green-500 rounded-full p-4 shadow-lg"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ 
                        type: "spring", 
                        damping: 15, 
                        stiffness: 300,
                        duration: 0.5 
                      }}
                    >
                      <CheckCircle className="h-8 w-8 text-white" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={onClose}
                className="absolute top-3 right-4 text-white/60 hover:text-white touch-feedback z-20"
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
              <motion.div 
                className="flex items-center gap-2 mb-4"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Bolt className="h-5 w-5 text-primary" />
                <h2 className="text-lg text-white font-semibold">Token Balance</h2>
              </motion.div>
              <motion.div 
                className="text-center mb-6"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-4xl text-white font-bold">
                  {loading ? '...' : tokenBalance?.toLocaleString()}
                </div>
              </motion.div>
              <motion.button
                onClick={handleAddTokens}
                className="btn btn-primary w-full flex items-center justify-center gap-2 shadow-elevation-2"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Plus className="h-4 w-4" />
                Add Tokens
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AddTokensModal 
        isOpen={showAddTokensModal} 
        onClose={() => setShowAddTokensModal(false)} 
      />
    </>
  );
};

export default TokenModal; 