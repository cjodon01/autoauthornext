'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ComponentLoaderProps {
  height?: string;
  text?: string;
}

const ComponentLoader: React.FC<ComponentLoaderProps> = ({ 
  height = 'h-48', 
  text = 'Loading...' 
}) => {
  return (
    <div className={`${height} bg-dark-card border border-dark-border rounded-lg flex items-center justify-center`}>
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-white/60 text-sm">{text}</p>
      </div>
    </div>
  );
};

export default ComponentLoader;