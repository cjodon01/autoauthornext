'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug,
  Copy,
  ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // In production, you would send this to your error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/dashboard';
  };

  handleCopyError = async (): Promise<void> => {
    const errorDetails = this.getErrorDetails();
    try {
      await navigator.clipboard.writeText(errorDetails);
      toast.success('Error details copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy error details');
    }
  };

  handleReportBug = (): void => {
    const errorDetails = this.getErrorDetails();
    const subject = encodeURIComponent('Bug Report: Application Error');
    const body = encodeURIComponent(`
Error Details:
${errorDetails}

Steps to reproduce:
1. 
2. 
3. 

Expected behavior:

Actual behavior:

Additional context:
    `.trim());
    
    const mailtoLink = `mailto:support@autoauthor.cc?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  };

  getErrorDetails = (): string => {
    const { error, errorInfo } = this.state;
    
    return `
Error: ${error?.name || 'Unknown Error'}
Message: ${error?.message || 'No message available'}
Stack: ${error?.stack || 'No stack trace available'}

Component Stack:
${errorInfo?.componentStack || 'No component stack available'}

Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
    `.trim();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full bg-dark-card border border-dark-border rounded-xl p-8 text-center"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 20 }}
              className="w-20 h-20 mx-auto mb-6 bg-red-400/20 rounded-full flex items-center justify-center"
            >
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h1 className="text-2xl font-bold text-white mb-3">
                Oops! Something went wrong
              </h1>
              <p className="text-white/70 mb-4">
                We encountered an unexpected error. This has been logged and our team will investigate.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-dark-lighter border border-dark-border rounded-lg p-4 mb-4">
                  <summary className="cursor-pointer text-white/80 font-medium mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="text-red-400 text-sm font-mono overflow-auto">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.name}
                    </div>
                    <div className="mb-2">
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div className="mb-2">
                        <strong>Stack:</strong>
                        <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center mb-6"
            >
              <button
                onClick={this.handleRetry}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="btn bg-dark-lighter hover:bg-dark-border text-white border border-dark-border inline-flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </button>
            </motion.div>

            {/* Additional Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-2 justify-center text-sm"
            >
              <button
                onClick={this.handleCopyError}
                className="text-white/60 hover:text-white inline-flex items-center gap-1 transition-colors"
              >
                <Copy className="h-3 w-3" />
                Copy Error Details
              </button>
              
              <span className="text-white/40 hidden sm:inline">•</span>
              
              <button
                onClick={this.handleReportBug}
                className="text-white/60 hover:text-white inline-flex items-center gap-1 transition-colors"
              >
                <Bug className="h-3 w-3" />
                Report Bug
              </button>
              
              <span className="text-white/40 hidden sm:inline">•</span>
              
              <a
                href="https://status.autoauthor.cc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white inline-flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Service Status
              </a>
            </motion.div>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-6 border-t border-dark-border"
            >
              <p className="text-white/50 text-xs">
                Error ID: {Date.now().toString(36)}-{Math.random().toString(36).substr(2, 5)}
              </p>
              <p className="text-white/40 text-xs mt-1">
                If the problem persists, please contact support with the error ID above.
              </p>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Hook for functional components to trigger error boundaries
export const useErrorHandler = () => {
  return React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    // This will be caught by the nearest error boundary
    throw error;
  }, []);
};