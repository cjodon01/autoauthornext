// Production monitoring and analytics setup

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  delta?: number;
  id?: string;
  timestamp?: number;
}

class MonitoringService {
  private static instance: MonitoringService;
  private isProduction = process.env.NODE_ENV === 'production';
  private analyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  private vercelAnalytics = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID;

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Initialize monitoring services
  init() {
    if (typeof window === 'undefined') return;

    this.initGoogleAnalytics();
    this.initPerformanceMonitoring();
    this.initErrorTracking();
    this.initWebVitals();
  }

  // Google Analytics 4
  private initGoogleAnalytics() {
    if (!this.analyticsId || !this.isProduction) return;

    // Load gtag script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.analyticsId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(arguments);
    }
    
    gtag('js', new Date());
    gtag('config', this.analyticsId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    // Attach gtag to window for use
    (window as any).gtag = gtag;
  }

  // Track page views
  trackPageView(url: string, title?: string) {
    if (!this.isProduction) {
      console.log('📊 Page view:', { url, title });
      return;
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', this.analyticsId, {
        page_title: title || document.title,
        page_location: url,
      });
    }
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent) {
    if (!this.isProduction) {
      console.log('📈 Event:', event);
      return;
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.name, {
        ...event.properties,
        timestamp: event.timestamp || Date.now(),
      });
    }
  }

  // Track user interactions
  trackUserAction(action: string, category: string, label?: string, value?: number) {
    this.trackEvent({
      name: action,
      properties: {
        event_category: category,
        event_label: label,
        value: value,
      },
    });
  }

  // Track errors
  trackError(error: Error, context?: Record<string, any>) {
    console.error('🚨 Error tracked:', error, context);
    
    this.trackEvent({
      name: 'exception',
      properties: {
        description: error.message,
        fatal: false,
        error_name: error.name,
        error_stack: error.stack,
        ...context,
      },
    });

    // Send to external error tracking service
    if (this.isProduction) {
      this.sendErrorToService(error, context);
    }
  }

  // Performance monitoring
  private initPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.observePerformanceMetrics();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor network requests
    this.monitorNetworkRequests();
  }

  private observePerformanceMetrics() {
    // First Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.reportPerformanceMetric({
          name: 'FCP',
          value: entry.startTime,
          timestamp: Date.now(),
        });
      }
    }).observe({ type: 'paint', buffered: true });

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        const lcp = entries[entries.length - 1];
        this.reportPerformanceMetric({
          name: 'LCP',
          value: lcp.startTime,
          timestamp: Date.now(),
        });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as any;
        this.reportPerformanceMetric({
          name: 'FID',
          value: fidEntry.processingStart - fidEntry.startTime,
          timestamp: Date.now(),
        });
      }
    }).observe({ type: 'first-input', buffered: true });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const clsEntry = entry as any;
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value;
        }
      }
      this.reportPerformanceMetric({
        name: 'CLS',
        value: clsValue,
        timestamp: Date.now(),
      });
    }).observe({ type: 'layout-shift', buffered: true });
  }

  private monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.reportPerformanceMetric({
          name: 'memory_used',
          value: memory.usedJSHeapSize,
          timestamp: Date.now(),
        });

        // Alert on high memory usage
        if (memory.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB
          this.trackEvent({
            name: 'high_memory_usage',
            properties: {
              used: memory.usedJSHeapSize,
              total: memory.totalJSHeapSize,
              limit: memory.jsHeapSizeLimit,
            },
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  private monitorNetworkRequests() {
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        
        this.reportPerformanceMetric({
          name: 'network_request',
          value: duration,
          timestamp: Date.now(),
        });

        return response;
      } catch (error) {
        this.trackError(error as Error, {
          type: 'network_error',
          url: typeof args[0] === 'string' ? args[0] : (args[0] as any)?.url || args[0]?.toString(),
        });
        throw error;
      }
    };
  }

  private reportPerformanceMetric(metric: PerformanceMetric) {
    if (!this.isProduction) {
      console.log('⚡ Performance metric:', metric);
      return;
    }

    // Send to analytics
    this.trackEvent({
      name: 'performance_metric',
      properties: {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_delta: metric.delta,
        metric_id: metric.id,
      },
    });
  }

  // Error tracking and reporting
  private initErrorTracking() {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError(event.error || new Error(event.message), {
        type: 'javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
        reason: event.reason,
      });
    });

    // React error boundary integration
    window.addEventListener('react-error', ((event: CustomEvent) => {
      this.trackError(event.detail.error, {
        type: 'react_error',
        component: event.detail.componentStack,
        errorBoundary: event.detail.errorBoundary,
      });
    }) as EventListener);
  }

  private initWebVitals() {
    // Web Vitals reporting can be enhanced with web-vitals library
    // This is a basic implementation
    if (typeof window === 'undefined') return;

    // Report when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.reportPageSession();
      }
    });

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.reportPageSession();
    });
  }

  private reportPageSession() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.trackEvent({
        name: 'page_session',
        properties: {
          duration: Date.now() - navigation.loadEventStart,
          page_load_time: navigation.loadEventEnd - navigation.loadEventStart,
          dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        },
      });
    }
  }

  private sendErrorToService(error: Error, context?: Record<string, any>) {
    // Implement integration with error tracking services
    // Example: Sentry, Bugsnag, LogRocket, etc.
    
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Sentry integration would go here
      console.log('📤 Sending error to Sentry:', error);
    }
    
    if (process.env.NEXT_PUBLIC_BUGSNAG_API_KEY) {
      // Bugsnag integration would go here
      console.log('📤 Sending error to Bugsnag:', error);
    }
  }

  // Feature flag and A/B testing support
  isFeatureEnabled(flagName: string): boolean {
    if (!this.isProduction) return true; // All features enabled in development
    
    // Implement feature flag logic
    // This could integrate with LaunchDarkly, Split.io, etc.
    const features = {
      'new-dashboard': true,
      'advanced-analytics': true,
      'beta-features': false,
    };
    
    return features[flagName as keyof typeof features] ?? false;
  }

  // A/B test variant assignment
  getVariant(testName: string): string {
    if (!this.isProduction) return 'control';
    
    // Simple hash-based assignment
    const userId = this.getUserId();
    const hash = this.simpleHash(testName + userId);
    
    return hash % 2 === 0 ? 'control' : 'variant';
  }

  private getUserId(): string {
    // Get user ID from localStorage or generate anonymous ID
    let userId = localStorage.getItem('anonymous_user_id');
    if (!userId) {
      userId = 'anon_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('anonymous_user_id', userId);
    }
    return userId;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();

// Convenience functions
export const trackPageView = (url: string, title?: string) => monitoring.trackPageView(url, title);
export const trackEvent = (event: AnalyticsEvent) => monitoring.trackEvent(event);
export const trackError = (error: Error, context?: Record<string, any>) => monitoring.trackError(error, context);
export const trackUserAction = (action: string, category: string, label?: string, value?: number) => 
  monitoring.trackUserAction(action, category, label, value);
export const isFeatureEnabled = (flagName: string) => monitoring.isFeatureEnabled(flagName);
export const getVariant = (testName: string) => monitoring.getVariant(testName);

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  monitoring.init();
}