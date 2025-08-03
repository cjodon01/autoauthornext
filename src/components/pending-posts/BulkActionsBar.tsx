'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw,
  Copy,
  Calendar,
  X,
  ChevronDown
} from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onSelectAll: (selected: boolean) => void;
  onDeselectAll: () => void;
  onBulkAction: (action: string) => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onBulkAction
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-primary/10 border border-primary/20 rounded-xl p-4 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        {/* Left: Selection Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectAll(true)}
              className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
            >
              <CheckSquare className="h-4 w-4" />
              Select All
            </button>
            <span className="text-white/40">|</span>
            <button
              onClick={onDeselectAll}
              className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
              Deselect
            </button>
          </div>
          
          <div className="text-sm text-white/70">
            <span className="font-semibold text-primary">{selectedCount}</span> post{selectedCount !== 1 ? 's' : ''} selected
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Primary Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBulkAction('pause')}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-lg transition-colors text-sm"
              title="Pause selected posts"
            >
              <Pause className="h-4 w-4" />
              Pause
            </button>
            
            <button
              onClick={() => onBulkAction('resume')}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded-lg transition-colors text-sm"
              title="Resume selected posts"
            >
              <Play className="h-4 w-4" />
              Resume
            </button>
            
            <button
              onClick={() => onBulkAction('retry')}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg transition-colors text-sm"
              title="Retry failed posts"
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </button>
          </div>

          {/* Advanced Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-dark-lighter hover:bg-dark-border text-white/80 hover:text-white rounded-lg transition-colors text-sm"
            >
              More
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-xl z-10"
              >
                <div className="p-2">
                  <button
                    onClick={() => {
                      onBulkAction('duplicate');
                      setShowAdvanced(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-dark-lighter rounded-lg transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate Posts
                  </button>
                  
                  <button
                    onClick={() => {
                      onBulkAction('reschedule');
                      setShowAdvanced(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-dark-lighter rounded-lg transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    Reschedule
                  </button>
                  
                  <div className="border-t border-dark-border my-1" />
                  
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${selectedCount} post${selectedCount !== 1 ? 's' : ''}? This action cannot be undone.`)) {
                        onBulkAction('delete');
                      }
                      setShowAdvanced(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Posts
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-3 pt-3 border-t border-primary/20">
        <div className="flex items-center justify-between text-xs text-white/60">
          <div>
            Bulk actions will be applied to all selected posts
          </div>
          <div className="flex items-center gap-4">
            <span>Use Shift+Click to select ranges</span>
            <span>Ctrl/Cmd+Click for individual selection</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BulkActionsBar;