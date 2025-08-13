'use client';

import { useState, useCallback } from 'react';
import { useNotificationHelpers } from '../components/NotificationSystem';

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorCode?: string;
  context?: string;
  retryable?: boolean;
}

export interface UseErrorHandlingOptions {
  defaultRetryable?: boolean;
  enableNotifications?: boolean;
  logErrors?: boolean;
}

export function useErrorHandling(options: UseErrorHandlingOptions = {}) {
  const {
    defaultRetryable = true,
    enableNotifications = true,
    logErrors = true
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null
  });

  const { notifyError } = useNotificationHelpers();

  const handleError = useCallback((
    error: Error | string,
    context?: string,
    options?: {
      retryable?: boolean;
      errorCode?: string;
      showNotification?: boolean;
    }
  ) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const isRetryable = options?.retryable ?? defaultRetryable;
    const showNotification = options?.showNotification ?? enableNotifications;

    // Log error if enabled
    if (logErrors) {
      console.error(`Error in ${context || 'unknown context'}:`, errorObj);
    }

    // Update error state
    setErrorState({
      hasError: true,
      error: errorObj,
      errorCode: options?.errorCode,
      context,
      retryable: isRetryable
    });

    // Show notification if enabled
    if (showNotification) {
      const title = getErrorTitle(errorObj, options?.errorCode);
      const message = getErrorMessage(errorObj, context);
      notifyError(title, message);
    }

    return errorObj;
  }, [defaultRetryable, enableNotifications, logErrors, notifyError]);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null
    });
  }, []);

  const retryOperation = useCallback((operation: () => void | Promise<void>) => {
    clearError();
    try {
      const result = operation();
      if (result instanceof Promise) {
        return result.catch((error) => {
          handleError(error, errorState.context);
          throw error;
        });
      }
      return result;
    } catch (error) {
      handleError(error as Error, errorState.context);
      throw error;
    }
  }, [clearError, handleError, errorState.context]);

  return {
    errorState,
    handleError,
    clearError,
    retryOperation,
    hasError: errorState.hasError,
    error: errorState.error,
    isRetryable: errorState.retryable
  };
}

// Utility functions for error handling
export function getErrorTitle(error: Error, errorCode?: string): string {
  if (errorCode) {
    switch (errorCode) {
      case 'NETWORK_ERROR':
        return 'Connection Problem';
      case 'UNAUTHORIZED':
        return 'Access Denied';
      case 'FORBIDDEN':
        return 'Permission Error';
      case 'NOT_FOUND':
        return 'Not Found';
      case 'VALIDATION_ERROR':
        return 'Invalid Data';
      case 'SERVER_ERROR':
        return 'Server Error';
      default:
        return 'Error';
    }
  }

  // Default based on error message
  if (error.message.toLowerCase().includes('network')) {
    return 'Connection Problem';
  }
  if (error.message.toLowerCase().includes('unauthorized')) {
    return 'Access Denied';
  }
  if (error.message.toLowerCase().includes('not found')) {
    return 'Not Found';
  }

  return 'Something Went Wrong';
}

export function getErrorMessage(error: Error, context?: string): string {
  const baseMessage = error.message || 'An unexpected error occurred';
  
  if (context) {
    return `${baseMessage} while ${context}`;
  }

  return baseMessage;
}

export function isNetworkError(error: Error): boolean {
  return (
    error.message.toLowerCase().includes('network') ||
    error.message.toLowerCase().includes('fetch') ||
    error.message.toLowerCase().includes('connection') ||
    error.name === 'NetworkError' ||
    error.name === 'TypeError' && error.message.includes('Failed to fetch')
  );
}

export function isTimeoutError(error: Error): boolean {
  return (
    error.message.toLowerCase().includes('timeout') ||
    error.name === 'TimeoutError'
  );
}

export function isValidationError(error: Error): boolean {
  return (
    error.message.toLowerCase().includes('validation') ||
    error.message.toLowerCase().includes('invalid') ||
    error.name === 'ValidationError'
  );
}

// Higher-order function for wrapping async operations with error handling
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string,
  options?: {
    retryable?: boolean;
    errorCode?: string;
    onError?: (error: Error) => void;
  }
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      if (options?.onError) {
        options.onError(errorObj);
      }

      // Log error with context
      console.error(`Error in ${context || 'async operation'}:`, errorObj);

      throw errorObj;
    }
  };
}

// Async operation wrapper with automatic retry
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  backoff: number = 2
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying (with exponential backoff)
      const waitTime = delay * Math.pow(backoff, attempt);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

// Error boundary compatible error types
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network connection failed', context?: string) {
    super(message, 'NETWORK_ERROR', context, true);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: string) {
    super(message, 'VALIDATION_ERROR', context, false);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Access denied', context?: string) {
    super(message, 'UNAUTHORIZED', context, false);
    this.name = 'UnauthorizedError';
  }
}