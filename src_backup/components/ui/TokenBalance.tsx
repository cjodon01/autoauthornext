'use client';

import React from 'react';
import { Bolt } from 'lucide-react';
import { useTokenBalance } from '../../hooks/useTokenBalance';

interface TokenBalanceProps {
  onClick?: () => void;
  className?: string;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({ onClick, className = '' }) => {
  const { tokenBalance, loading } = useTokenBalance();

  if (loading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Bolt className="h-4 w-4 text-primary" />
        <span className="text-white/70 text-sm animate-pulse">...</span>
      </div>
    );
  }

  if (tokenBalance === null) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 cursor-pointer hover:bg-dark-lighter transition-colors px-3 py-1 bg-dark-border rounded-full ${className}`}
    >
      <Bolt className="h-4 w-4 text-primary" />
      <span className="text-white/70 text-sm">{tokenBalance.toLocaleString()}</span>
    </button>
  );
};

export default TokenBalance;