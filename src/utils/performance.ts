// Performance optimization utilities

import React from 'react';
import dynamic from 'next/dynamic';

// Lazy loading utility for heavy components
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFunc);
  
  return function WrappedComponent(props: React.ComponentProps<T>) {
    return React.createElement(
      React.Suspense,
      {
        fallback: fallback ? React.createElement(fallback) : React.createElement(
          'div',
          { className: "flex items-center justify-center p-8" },
          React.createElement('div', { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" })
        )
      },
      React.createElement(LazyComponent, props)
    );
  };
}

// Bundle size analyzer helper
export function logBundleInfo() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('Bundle Analysis:', {
      userAgent: navigator.userAgent,
      screen: `${screen.width}x${screen.height}`,
      connection: (navigator as any).connection?.effectiveType,
      memory: (performance as any).memory?.usedJSHeapSize,
    });
  }
}

// Performance metrics collection
export class PerformanceMetrics {
  private static instance: PerformanceMetrics;
  private metrics: Map<string, number[]> = new Map();

  static getInstance() {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics();
    }
    return PerformanceMetrics.instance;
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getAllMetrics() {
    const result: Record<string, { average: number; samples: number }> = {};
    for (const [name, values] of this.metrics.entries()) {
      result[name] = {
        average: this.getAverageMetric(name),
        samples: values.length,
      };
    }
    return result;
  }
}

// Web Vitals measurement
export function measureWebVitals() {
  if (typeof window === 'undefined') return;

  const metrics = PerformanceMetrics.getInstance();
  
  // Measure LCP (Largest Contentful Paint)
  if ('LargestContentfulPaint' in window) {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        const lcp = entries[entries.length - 1];
        metrics.recordMetric('LCP', lcp.startTime);
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  }

  // Measure FID (First Input Delay)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fidEntry = entry as any;
      const fid = fidEntry.processingStart - fidEntry.startTime;
      metrics.recordMetric('FID', fid);
    }
  }).observe({ type: 'first-input', buffered: true });

  // Measure CLS (Cumulative Layout Shift)
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const clsEntry = entry as any;
      if (!clsEntry.hadRecentInput) {
        clsValue += clsEntry.value;
      }
    }
    metrics.recordMetric('CLS', clsValue);
  }).observe({ type: 'layout-shift', buffered: true });
}

// Image optimization helper
export function getOptimizedImageProps(
  src: string,
  alt: string,
  width?: number,
  height?: number
) {
  return {
    src,
    alt,
    width,
    height,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    style: { aspectRatio: width && height ? `${width}/${height}` : undefined },
  };
}

// Code splitting utility
export function createDynamicImport(
  importPath: () => Promise<any>,
  options?: {
    loading?: () => React.ReactElement;
    ssr?: boolean;
  }
) {
  return dynamic(importPath, {
    loading: options?.loading || (() => React.createElement('div', { className: "animate-pulse bg-gray-200 rounded" })),
    ssr: options?.ssr ?? true,
  });
}

// Resource hints for preloading
export function addResourceHints() {
  if (typeof document === 'undefined') return;

  const criticalResources = [
    '/fonts/inter.woff2',
    '/fonts/lexend.woff2',
    '/images/logo.svg',
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.woff2') ? 'font' : 'image';
    if (resource.endsWith('.woff2')) {
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
}

// Bundle size warning
export function warnLargeBundles() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const memory = (performance as any).memory;
    if (memory && memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
      console.warn(
        `🚨 Large bundle detected: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`
      );
    }
  }
}