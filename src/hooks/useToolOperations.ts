import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '../lib/supabase/client';
import { useAuth } from '../lib/auth/provider';
import { ToolErrorHandler, LoadingStateManager, SuccessFeedback, InfoFeedback } from '../utils/errorHandling';
import type { ToolError } from '../utils/errorHandling';

interface UseToolOperationsOptions {
  autoFetch?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

interface ToolState<T> {
  data: T | null;
  loading: boolean;
  error: ToolError | null;
  lastUpdated: Date | null;
}

export function useToolOperations<T>(
  operationKey: string,
  options: UseToolOperationsOptions = {}
) {
  const { user } = useAuth();
  const supabase = createClient();
  const { autoFetch = false, retryAttempts = 3, retryDelay = 1000 } = options;

  const [state, setState] = useState<ToolState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
    LoadingStateManager.setLoading(operationKey, loading);
  }, [operationKey]);

  const setError = useCallback((error: ToolError | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
    if (error) {
      ToolErrorHandler.showError(error, operationKey);
    }
  }, [operationKey]);

  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
      error: null,
      loading: false,
      lastUpdated: new Date()
    }));
  }, []);

  const executeOperation = useCallback(async (
    operation: () => Promise<T>,
    context: string = operationKey
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await ToolErrorHandler.withRetry(
        operation,
        retryAttempts,
        retryDelay,
        context
      );

      if (result !== null) {
        setData(result);
        return result;
      } else {
        setError({
          type: 'server',
          message: 'Operation failed after retries',
          retryable: true
        });
        return null;
      }
    } catch (error) {
      const toolError = ToolErrorHandler.handle(error, context);
      setError(toolError);
      return null;
    }
  }, [operationKey, retryAttempts, retryDelay, setLoading, setError, setData]);

  const refresh = useCallback(async (operation: () => Promise<T>) => {
    return await executeOperation(operation);
  }, [executeOperation]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const clearData = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null
    });
  }, []);

  // Auto-fetch effect
  useEffect(() => {
    if (autoFetch && user) {
      // This will be handled by the specific tool implementation
      InfoFeedback.show('Auto-fetch enabled', 'Data will be loaded automatically');
    }
  }, [autoFetch, user]);

  return {
    ...state,
    executeOperation,
    refresh,
    setLoading,
    setError,
    setData,
    clearError,
    clearData,
    isLoading: LoadingStateManager.isLoading(operationKey)
  };
}

// Specialized hooks for common operations

export function useSupabaseQuery<T>(
  table: string,
  query: (supabase: any) => any,
  options: UseToolOperationsOptions = {}
) {
  const supabase = createClient();
  const operationKey = `supabase-query-${table}`;

  const executeQuery = useCallback(async () => {
    const { data, error } = await query(supabase);
    
    if (error) {
      throw error;
    }
    
    return data as T;
  }, [query, supabase]);

  return useToolOperations<T>(operationKey, options);
}

export function useSupabaseMutation<T>(
  table: string,
  mutation: (supabase: any) => Promise<{ data: T; error: any }>,
  options: UseToolOperationsOptions = {}
) {
  const supabase = createClient();
  const operationKey = `supabase-mutation-${table}`;

  const executeMutation = useCallback(async () => {
    const { data, error } = await mutation(supabase);
    
    if (error) {
      throw error;
    }
    
    return data as T;
  }, [mutation, supabase]);

  return useToolOperations<T>(operationKey, options);
}

export function useEdgeFunction<T>(
  functionName: string,
  options: UseToolOperationsOptions = {}
) {
  const { user } = useAuth();
  const operationKey = `edge-function-${functionName}`;
  const supabase = createClient();

  const executeFunction = useCallback(async (payload: any) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get the current session to access the access token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No valid session found');
    }

    const response = await fetch(`/api/edge-functions/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  }, [functionName, user]);

  return useToolOperations<T>(operationKey, options);
}

// Hook for managing form states
export function useFormState<T extends Record<string, any>>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const updateFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setAllErrors = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrors(newErrors);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setIsSubmitting(false);
  }, [initialState]);

  const validateForm = useCallback((validators: Record<keyof T, (value: T[keyof T]) => string | null>) => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validators).forEach(key => {
      const field = key as keyof T;
      const validator = validators[field];
      const error = validator(formData[field]);
      
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateFields,
    setFieldError,
    setErrors: setAllErrors,
    clearErrors,
    resetForm,
    validateForm,
    setIsSubmitting
  };
}

// Hook for managing pagination
export function usePagination(initialPage: number = 1, initialPageSize: number = 10) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const goToPrevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPrevPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
    setTotalItems(0);
  }, [initialPage, initialPageSize]);

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    setPageSize,
    setTotalItems,
    resetPagination
  };
}

// Hook for managing search and filtering
export function useSearchAndFilter<T>(
  items: T[],
  searchFields: (keyof T)[],
  filterFields: (keyof T)[]
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Partial<Record<keyof T, any>>>({});
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([field, filterValue]) => {
      if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
        result = result.filter(item => {
          const value = item[field as keyof T];
          if (Array.isArray(filterValue)) {
            return filterValue.includes(value);
          }
          return value === filterValue;
        });
      }
    });

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [items, searchTerm, filters, sortField, sortDirection, searchFields]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const clearAll = useCallback(() => {
    setSearchTerm('');
    setFilters({});
    setSortField(null);
    setSortDirection('asc');
  }, []);

  const setFilter = useCallback((field: keyof T, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const removeFilter = useCallback((field: keyof T) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
  }, []);

  const toggleSort = useCallback((field: keyof T) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  return {
    searchTerm,
    filters,
    sortField,
    sortDirection,
    filteredAndSortedItems,
    setSearchTerm,
    setFilter,
    removeFilter,
    toggleSort,
    clearSearch,
    clearFilters,
    clearAll
  };
} 