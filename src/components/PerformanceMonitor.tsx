'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Clock, 
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  X,
  Settings,
  BarChart3
} from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  domNodes: number;
  networkLatency: number;
  cacheHitRate: number;
}

interface PerformanceIssue {
  id: string;
  type: 'warning' | 'error';
  message: string;
  timestamp: number;
  metric: keyof PerformanceMetrics;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showWidget?: boolean;
  thresholds?: Partial<PerformanceMetrics>;
  onIssue?: (issue: PerformanceIssue) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  showWidget = process.env.NODE_ENV === 'development',
  thresholds = {
    fps: 30,
    memoryUsage: 100 * 1024 * 1024, // 100MB
    loadTime: 3000, // 3 seconds
    domNodes: 1500,
    networkLatency: 1000, // 1 second
    cacheHitRate: 80 // 80%
  },
  onIssue
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    loadTime: 0,
    domNodes: 0,
    networkLatency: 0,
    cacheHitRate: 100
  });
  
  const [issues, setIssues] = useState<PerformanceIssue[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const metricsIntervalId = useRef<NodeJS.Timeout | null>(null);
  const networkCallInProgress = useRef(false);

  // FPS Monitoring
  const measureFPS = () => {
    const now = performance.now();
    frameCount.current++;
    
    if (now - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
      
      fpsHistory.current.push(fps);
      if (fpsHistory.current.length > 60) {
        fpsHistory.current.shift();
      }
      
      const avgFPS = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;
      
      setMetrics(prev => ({ ...prev, fps: Math.round(avgFPS) }));
      
      frameCount.current = 0;
      lastTime.current = now;
      
      // Check FPS threshold
      if (thresholds.fps && avgFPS < thresholds.fps) {
        addIssue('warning', `Low FPS detected: ${Math.round(avgFPS)}`, 'fps');
      }
    }
    
    if (enabled) {
      animationFrameId.current = requestAnimationFrame(measureFPS);
    }
  };

  // Memory Usage Monitoring
  const measureMemory = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedJSHeapSize = memory.usedJSHeapSize;
      
      setMetrics(prev => ({ ...prev, memoryUsage: usedJSHeapSize }));
      
      // Check memory threshold
      if (thresholds.memoryUsage && usedJSHeapSize > thresholds.memoryUsage) {
        addIssue('warning', `High memory usage: ${formatBytes(usedJSHeapSize)}`, 'memoryUsage');
      }
    }
  };

  // DOM Nodes Monitoring
  const measureDOMNodes = () => {
    const domNodes = document.querySelectorAll('*').length;
    setMetrics(prev => ({ ...prev, domNodes }));
    
    // Check DOM nodes threshold
    if (thresholds.domNodes && domNodes > thresholds.domNodes) {
      addIssue('warning', `High DOM node count: ${domNodes}`, 'domNodes');
    }
  };

  // Network Latency Monitoring - Reduced frequency in production
  const measureNetworkLatency = async () => {
    if (networkCallInProgress.current) return;
    
    try {
      networkCallInProgress.current = true;
      const start = performance.now();
      
      // Use a simple ping endpoint or fallback
      const response = await fetch('/api/ping', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }).catch(() => {
        // Fallback to any available endpoint
        return fetch('/', { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        });
      });
      
      const latency = performance.now() - start;
      
      setMetrics(prev => ({ ...prev, networkLatency: latency }));
      
      // Check network latency threshold
      if (thresholds.networkLatency && latency > thresholds.networkLatency) {
        addIssue('warning', `High network latency: ${Math.round(latency)}ms`, 'networkLatency');
      }
    } catch (error) {
      // Network error - don't spam issues
      const lastIssue = issues.find(i => i.metric === 'networkLatency');
      if (!lastIssue || Date.now() - lastIssue.timestamp > 30000) { // Only show every 30 seconds
        addIssue('error', 'Network connectivity issues detected', 'networkLatency');
      }
    } finally {
      networkCallInProgress.current = false;
    }
  };

  // Page Load Time
  const measureLoadTime = () => {
    if (performance.navigation && performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({ ...prev, loadTime }));
      
      // Check load time threshold
      if (thresholds.loadTime && loadTime > thresholds.loadTime) {
        addIssue('warning', `Slow page load: ${formatTime(loadTime)}`, 'loadTime');
      }
    }
  };

  // Add Performance Issue
  const addIssue = (type: 'warning' | 'error', message: string, metric: keyof PerformanceMetrics) => {
    const issue: PerformanceIssue = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: Date.now(),
      metric
    };
    
    setIssues(prev => {
      const newIssues = [issue, ...prev].slice(0, 10); // Keep last 10 issues
      return newIssues;
    });
    
    onIssue?.(issue);
  };

  // Format Utilities
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getMetricStatus = (metric: keyof PerformanceMetrics, value: number) => {
    const threshold = thresholds[metric];
    if (!threshold) return 'good';
    
    switch (metric) {
      case 'fps':
        return value >= threshold ? 'good' : 'poor';
      case 'memoryUsage':
      case 'loadTime':
      case 'domNodes':
      case 'networkLatency':
        return value <= threshold ? 'good' : 'poor';
      default:
        return 'good';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-white/60';
    }
  };

  const dismissIssue = (issueId: string) => {
    setIssues(prev => prev.filter(issue => issue.id !== issueId));
  };

  // Initialize monitoring
  useEffect(() => {
    if (!enabled) return;

    // Start FPS monitoring
    animationFrameId.current = requestAnimationFrame(measureFPS);
    
    // Start periodic measurements - reduced frequency in production
    const interval = process.env.NODE_ENV === 'production' ? 10000 : 5000; // 10s in prod, 5s in dev
    metricsIntervalId.current = setInterval(() => {
      measureMemory();
      measureDOMNodes();
      // Only measure network latency in development or if explicitly enabled
      if (process.env.NODE_ENV === 'development') {
        measureNetworkLatency();
      }
    }, interval);

    // Measure initial load time
    if (document.readyState === 'complete') {
      measureLoadTime();
    } else {
      window.addEventListener('load', measureLoadTime);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (metricsIntervalId.current) {
        clearInterval(metricsIntervalId.current);
      }
      window.removeEventListener('load', measureLoadTime);
      networkCallInProgress.current = false;
    };
  }, [enabled]);

  if (!enabled || !showWidget) return null;

  return (
    <>
      {/* Performance Widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className="bg-dark-card border border-dark-border rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-dark-lighter">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-white">Performance</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <BarChart3 className="h-3 w-3" />
              </button>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <Settings className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Metrics */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-3 space-y-2"
              >
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-blue-400" />
                    <span className="text-white/60">FPS:</span>
                    <span className={getStatusColor(getMetricStatus('fps', metrics.fps))}>
                      {metrics.fps}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-3 w-3 text-purple-400" />
                    <span className="text-white/60">RAM:</span>
                    <span className={getStatusColor(getMetricStatus('memoryUsage', metrics.memoryUsage))}>
                      {formatBytes(metrics.memoryUsage)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-amber-400" />
                    <span className="text-white/60">Load:</span>
                    <span className={getStatusColor(getMetricStatus('loadTime', metrics.loadTime))}>
                      {formatTime(metrics.loadTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Wifi className="h-3 w-3 text-green-400" />
                    <span className="text-white/60">Net:</span>
                    <span className={getStatusColor(getMetricStatus('networkLatency', metrics.networkLatency))}>
                      {Math.round(metrics.networkLatency)}ms
                    </span>
                  </div>
                </div>

                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-2 border-t border-dark-border"
                  >
                    <div className="text-xs text-white/60 space-y-1">
                      <div>DOM Nodes: {metrics.domNodes}</div>
                      <div>Cache Hit: {metrics.cacheHitRate}%</div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Performance Issues Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {issues.slice(0, 3).map((issue) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, x: 300, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.9 }}
              className={`p-3 rounded-lg border backdrop-blur-sm ${
                issue.type === 'error' 
                  ? 'bg-red-400/10 border-red-400/20' 
                  : 'bg-amber-400/10 border-amber-400/20'
              }`}
            >
              <div className="flex items-start gap-2">
                {issue.type === 'error' ? (
                  <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    issue.type === 'error' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    Performance {issue.type === 'error' ? 'Error' : 'Warning'}
                  </p>
                  <p className="text-xs text-white/80 mt-1">{issue.message}</p>
                </div>
                
                <button
                  onClick={() => dismissIssue(issue.id)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default PerformanceMonitor;