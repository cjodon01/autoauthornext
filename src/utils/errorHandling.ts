import { toast } from 'sonner';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ToolError {
  type: 'validation' | 'network' | 'auth' | 'permission' | 'server' | 'unknown';
  message: string;
  code?: string;
  retryable?: boolean;
}

export class ToolErrorHandler {
  static handle(error: any, context: string = 'Tool'): ToolError {
    console.error(`[${context}] Error:`, error);

    // Supabase errors
    if (error?.code) {
      switch (error.code) {
        case 'PGRST116':
          return {
            type: 'auth',
            message: 'Authentication required. Please log in again.',
            code: error.code,
            retryable: false
          };
        case 'PGRST301':
          return {
            type: 'permission',
            message: 'You don\'t have permission to perform this action.',
            code: error.code,
            retryable: false
          };
        case 'PGRST302':
          return {
            type: 'validation',
            message: 'Invalid data provided. Please check your input.',
            code: error.code,
            retryable: false
          };
        default:
          return {
            type: 'server',
            message: 'A server error occurred. Please try again.',
            code: error.code,
            retryable: true
          };
      }
    }

    // Network errors
    if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
      return {
        type: 'network',
        message: 'Network connection failed. Please check your internet connection.',
        retryable: true
      };
    }

    // Edge function errors
    if (error?.status) {
      switch (error.status) {
        case 400:
          return {
            type: 'validation',
            message: 'Invalid request. Please check your input.',
            code: error.status.toString(),
            retryable: false
          };
        case 401:
          return {
            type: 'auth',
            message: 'Authentication failed. Please log in again.',
            code: error.status.toString(),
            retryable: false
          };
        case 403:
          return {
            type: 'permission',
            message: 'Access denied. You don\'t have permission for this action.',
            code: error.status.toString(),
            retryable: false
          };
        case 404:
          return {
            type: 'server',
            message: 'Resource not found. Please check your request.',
            code: error.status.toString(),
            retryable: false
          };
        case 429:
          return {
            type: 'server',
            message: 'Rate limit exceeded. Please wait a moment and try again.',
            code: error.status.toString(),
            retryable: true
          };
        case 500:
          return {
            type: 'server',
            message: 'Server error. Please try again later.',
            code: error.status.toString(),
            retryable: true
          };
        default:
          return {
            type: 'server',
            message: 'An unexpected error occurred. Please try again.',
            code: error.status.toString(),
            retryable: true
          };
      }
    }

    // Generic error handling
    if (error?.message) {
      return {
        type: 'unknown',
        message: error.message,
        retryable: false
      };
    }

    // Fallback
    return {
      type: 'unknown',
      message: 'An unexpected error occurred. Please try again.',
      retryable: true
    };
  }

  static showError(error: ToolError, context: string = 'Tool') {
    const errorMessage = `[${context}] ${error.message}`;
    
    switch (error.type) {
      case 'auth':
        toast.error(errorMessage, {
          description: 'Please log in again to continue.',
          action: {
            label: 'Login',
            onClick: () => window.location.reload()
          }
        });
        break;
      case 'permission':
        toast.error(errorMessage, {
          description: 'Contact support if you believe this is an error.'
        });
        break;
      case 'validation':
        toast.error(errorMessage, {
          description: 'Please check your input and try again.'
        });
        break;
      case 'network':
        toast.error(errorMessage, {
          description: 'Check your internet connection and try again.',
          action: error.retryable ? {
            label: 'Retry',
            onClick: () => window.location.reload()
          } : undefined
        });
        break;
      case 'server':
        toast.error(errorMessage, {
          description: error.retryable ? 'This should resolve automatically.' : 'Please try again later.',
          action: error.retryable ? {
            label: 'Retry',
            onClick: () => window.location.reload()
          } : undefined
        });
        break;
      default:
        toast.error(errorMessage, {
          description: 'Please try again or contact support if the problem persists.'
        });
    }
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string = 'Tool',
    onError?: (error: ToolError) => void
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      const toolError = this.handle(error, context);
      this.showError(toolError, context);
      
      if (onError) {
        onError(toolError);
      }
      
      return null;
    }
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context: string = 'Tool'
  ): Promise<T | null> {
    let lastError: ToolError | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = this.handle(error, context);
        
        if (!lastError.retryable || attempt === maxRetries) {
          this.showError(lastError, context);
          return null;
        }

        // Show retry message
        toast.info(`Retrying... (${attempt}/${maxRetries})`, {
          description: lastError.message
        });

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    return null;
  }
}

// Validation utilities
export class ValidationUtils {
  static validateRequired(value: any, fieldName: string): string | null {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  }

  static validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  static validateUrl(url: string): string | null {
    try {
      new URL(url);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  }

  static validateLength(value: string, min: number, max: number, fieldName: string): string | null {
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    if (value.length > max) {
      return `${fieldName} must be no more than ${max} characters`;
    }
    return null;
  }

  static validateFileSize(file: File, maxSizeMB: number): string | null {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    return null;
  }

  static validateFileType(file: File, allowedTypes: string[]): string | null {
    if (!allowedTypes.includes(file.type)) {
      return `File type must be one of: ${allowedTypes.join(', ')}`;
    }
    return null;
  }
}

// Loading state management
export class LoadingStateManager {
  private static states = new Map<string, boolean>();

  static setLoading(key: string, loading: boolean) {
    this.states.set(key, loading);
  }

  static isLoading(key: string): boolean {
    return this.states.get(key) || false;
  }

  static clearLoading(key: string) {
    this.states.delete(key);
  }

  static clearAll() {
    this.states.clear();
  }
}

// Success feedback utilities
export class SuccessFeedback {
  static show(message: string, description?: string) {
    toast.success(message, {
      description,
      duration: 3000
    });
  }

  static showWithAction(message: string, actionLabel: string, action: () => void) {
    toast.success(message, {
      action: {
        label: actionLabel,
        onClick: action
      }
    });
  }
}

// Info feedback utilities
export class InfoFeedback {
  static show(message: string, description?: string) {
    toast.info(message, {
      description,
      duration: 4000
    });
  }

  static showWithAction(message: string, actionLabel: string, action: () => void) {
    toast.info(message, {
      action: {
        label: actionLabel,
        onClick: action
      }
    });
  }
} 