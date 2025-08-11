'use client'

import React from 'react'
import { Button } from './Button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError?: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo })
    
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        const Fallback = this.props.fallback
        return <Fallback error={this.state.error} resetError={this.resetError} />
      }

      // Default error UI
      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  title?: string
  description?: string
}

export function DefaultErrorFallback({ 
  error, 
  resetError,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.'
}: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-red-600">⚠️</span>
        </div>
        <h2 className="font-space text-xl font-semibold text-navy mb-2">
          {title}
        </h2>
        <p className="text-muted-foreground mb-6 font-inter">
          {description}
        </p>
        {resetError && (
          <Button onClick={resetError} className="mb-4">
            Try Again
          </Button>
        )}
        {error && process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-gray-50 p-4 rounded-lg text-sm">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Error Details (Development)
            </summary>
            <pre className="whitespace-pre-wrap text-red-600 font-mono text-xs">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

// Specialized error components
export function ApiErrorFallback({ 
  error, 
  resetError,
  action = 'loading data'
}: ErrorFallbackProps & { action?: string }) {
  const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('network')
  
  return (
    <DefaultErrorFallback
      error={error}
      resetError={resetError}
      title={isNetworkError ? 'Connection Error' : 'Unable to Load Data'}
      description={
        isNetworkError 
          ? 'Please check your internet connection and try again.'
          : `There was a problem ${action}. Please try again.`
      }
    />
  )
}

export function AuthErrorFallback({ 
  error, 
  resetError 
}: ErrorFallbackProps) {
  return (
    <DefaultErrorFallback
      error={error}
      resetError={resetError}
      title="Authentication Error"
      description="Your session may have expired. Please refresh the page or sign in again."
    />
  )
}

export function NotFoundFallback({ 
  resource = 'page',
  resetError
}: { resource?: string; resetError?: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-gray-400">📭</span>
        </div>
        <h2 className="font-space text-xl font-semibold text-navy mb-2">
          {resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found
        </h2>
        <p className="text-muted-foreground mb-6 font-inter">
          The {resource} you're looking for doesn't exist or has been moved.
        </p>
        {resetError && (
          <Button onClick={resetError}>
            Go Back
          </Button>
        )}
      </div>
    </div>
  )
}

// Hook for error handling
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleAsync = React.useCallback(
    async function <T>(
      asyncFn: () => Promise<T>,
      errorHandler?: (error: Error) => void
    ): Promise<T | null> {
      setIsLoading(true)
      setError(null)

      try {
        const result = await asyncFn()
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred')
        setError(error)
        
        if (errorHandler) {
          errorHandler(error)
        } else {
          console.error('Async operation failed:', error)
        }
        
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    isLoading,
    handleAsync,
    resetError
  }
}