'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  height?: string | number;
  offset?: number;
  onLoad?: () => void;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  fallback,
  height = 'auto',
  offset = 100,
  onLoad,
  className = '',
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true
}) => {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setHasLoaded(true);
            onLoad?.();
            
            // Unobserve if triggerOnce is true
            if (triggerOnce && observerRef.current) {
              observerRef.current.unobserve(container);
            }
          } else if (!triggerOnce) {
            setIsInView(false);
          }
        });
      },
      {
        threshold,
        rootMargin: `${offset}px 0px ${offset}px 0px`
      }
    );

    observerRef.current.observe(container);

    return () => {
      if (observerRef.current && container) {
        observerRef.current.unobserve(container);
      }
    };
  }, [threshold, offset, triggerOnce, onLoad]);

  const shouldRender = triggerOnce ? hasLoaded : isInView;
  const shouldShowFallback = !shouldRender && !hasLoaded;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        minHeight: typeof height === 'number' ? `${height}px` : height
      }}
    >
      <AnimatePresence mode="wait">
        {shouldShowFallback ? (
          <motion.div
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-full"
            style={{
              minHeight: typeof height === 'number' ? `${height}px` : height
            }}
          >
            {fallback || (
              <div className="flex items-center gap-2 text-white/60">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </motion.div>
        ) : shouldRender ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default LazyLoad;

// Hook for programmatic lazy loading
export const useLazyLoad = (
  threshold: number = 0.1,
  rootMargin: string = '0px'
) => {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setHasLoaded(true);
            observer.unobserve(element);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin]);

  return { ref, isInView, hasLoaded };
};

// Image lazy loading component
interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  fallback,
  onLoad,
  onError
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { ref, isInView } = useLazyLoad();

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <AnimatePresence mode="wait">
        {!isInView ? (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark-lighter flex items-center justify-center"
          >
            {fallback || (
              <div className="w-8 h-8 bg-dark-border rounded animate-pulse" />
            )}
          </motion.div>
        ) : imageError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-dark-lighter flex items-center justify-center"
          >
            <div className="text-white/40 text-center">
              <div className="text-2xl mb-2">⚠️</div>
              <div className="text-xs">Failed to load</div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="image"
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            className="relative"
          >
            <img
              src={src}
              alt={alt}
              width={width}
              height={height}
              className={`object-cover ${className}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            
            {!imageLoaded && (
              <div className="absolute inset-0 bg-dark-lighter flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-white/60" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};