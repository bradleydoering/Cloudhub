import { AppError, NetworkError, ValidationError, UnauthorizedError } from '../hooks/useErrorHandling';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  status?: number;
}

export interface ApiErrorOptions {
  context?: string;
  retryable?: boolean;
  silent?: boolean;
}

export class ApiErrorHandler {
  static handleSupabaseError(error: any, context?: string): never {
    console.error(`Supabase error in ${context}:`, error);

    // Handle specific Supabase error codes
    if (error?.code) {
      switch (error.code) {
        case '23505': // unique_violation
          throw new ValidationError(
            'This record already exists. Please check for duplicates.',
            context
          );
        case '23503': // foreign_key_violation
          throw new ValidationError(
            'Cannot perform this action due to related records.',
            context
          );
        case '23502': // not_null_violation
          throw new ValidationError(
            'Required fields are missing.',
            context
          );
        case '42501': // insufficient_privilege
          throw new UnauthorizedError(
            'You do not have permission to perform this action.',
            context
          );
        case 'PGRST116': // Row level security violation
          throw new UnauthorizedError(
            'Access denied by security policy.',
            context
          );
        default:
          break;
      }
    }

    // Handle HTTP status codes
    if (error?.status) {
      switch (error.status) {
        case 400:
          throw new ValidationError(
            error.message || 'Invalid request data.',
            context
          );
        case 401:
          throw new UnauthorizedError(
            'Authentication required.',
            context
          );
        case 403:
          throw new UnauthorizedError(
            'Access forbidden.',
            context
          );
        case 404:
          throw new AppError(
            'Resource not found.',
            'NOT_FOUND',
            context,
            false
          );
        case 409:
          throw new ValidationError(
            'Conflict: Resource already exists or is in use.',
            context
          );
        case 422:
          throw new ValidationError(
            error.message || 'Validation failed.',
            context
          );
        case 429:
          throw new AppError(
            'Too many requests. Please try again later.',
            'RATE_LIMIT',
            context,
            true
          );
        case 500:
        case 502:
        case 503:
        case 504:
          throw new AppError(
            'Server error. Please try again later.',
            'SERVER_ERROR',
            context,
            true
          );
        default:
          break;
      }
    }

    // Handle network errors
    if (this.isNetworkError(error)) {
      throw new NetworkError(
        'Unable to connect to the server. Please check your internet connection.',
        context
      );
    }

    // Generic error fallback
    const message = error?.message || error?.details || 'An unexpected error occurred';
    throw new AppError(message, 'UNKNOWN_ERROR', context, true);
  }

  static async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    options: ApiErrorOptions = {}
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (!options.silent) {
        this.handleSupabaseError(error, context);
      }
      throw error;
    }
  }

  static createMockApiResponse<T>(
    data: T,
    success: boolean = true,
    status: number = 200
  ): ApiResponse<T> {
    return {
      data: success ? data : undefined,
      error: success ? undefined : 'Mock error for testing',
      success,
      status
    };
  }

  static simulateApiCall<T>(
    data: T,
    delay: number = 1000,
    failureRate: number = 0
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < failureRate) {
          reject(new AppError('Simulated API failure', 'MOCK_ERROR', 'mock API call'));
        } else {
          resolve(this.createMockApiResponse(data));
        }
      }, delay);
    });
  }

  static async handleAsyncOperation<T>(
    operation: () => Promise<T>,
    context: string,
    options: {
      retries?: number;
      retryDelay?: number;
      timeout?: number;
      onRetry?: (attempt: number, error: Error) => void;
    } = {}
  ): Promise<T> {
    const {
      retries = 0,
      retryDelay = 1000,
      timeout = 30000,
      onRetry
    } = options;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Add timeout to the operation
        if (timeout > 0) {
          return await Promise.race([
            operation(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new AppError('Operation timed out', 'TIMEOUT', context)), timeout)
            )
          ]);
        } else {
          return await operation();
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < retries) {
          if (onRetry) {
            onRetry(attempt + 1, lastError);
          }
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    if (lastError) {
      this.handleSupabaseError(lastError, context);
    }
    throw new AppError('Operation failed after retries', 'RETRY_FAILED', context);
  }

  private static isNetworkError(error: any): boolean {
    return (
      error?.code === 'NETWORK_ERROR' ||
      error?.name === 'NetworkError' ||
      error?.name === 'TypeError' && error?.message?.includes('Failed to fetch') ||
      error?.message?.toLowerCase().includes('network') ||
      error?.message?.toLowerCase().includes('connection')
    );
  }

  // Utility for form validation errors
  static extractValidationErrors(error: any): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    if (error?.details && Array.isArray(error.details)) {
      error.details.forEach((detail: any) => {
        if (detail?.field && detail?.message) {
          if (!errors[detail.field]) {
            errors[detail.field] = [];
          }
          errors[detail.field]?.push(detail.message);
        }
      });
    }

    return errors;
  }

  // Utility for checking if an error is retryable
  static isRetryableError(error: any): boolean {
    if (error instanceof AppError) {
      return error.retryable;
    }

    // Network errors are usually retryable
    if (this.isNetworkError(error)) {
      return true;
    }

    // Server errors (5xx) are retryable
    if (error?.status >= 500 && error?.status < 600) {
      return true;
    }

    // Rate limiting is retryable
    if (error?.status === 429) {
      return true;
    }

    // Timeout errors are retryable
    if (error?.code === 'TIMEOUT' || error?.name === 'TimeoutError') {
      return true;
    }

    return false;
  }
}