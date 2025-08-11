import React from 'react'

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'pulse' | 'skeleton'
  className?: string
  text?: string
}

export function Loading({ 
  size = 'md', 
  variant = 'spinner', 
  className = '', 
  text 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  if (variant === 'spinner') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${sizeClasses[size]} animate-spin`}>
          <div className="w-full h-full border-2 border-coral/20 border-t-coral rounded-full"></div>
        </div>
        {text && (
          <span className="ml-3 text-sm text-muted-foreground font-inter">
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${sizeClasses[size]} bg-coral/20 rounded-full animate-pulse`}></div>
        {text && (
          <span className="ml-3 text-sm text-muted-foreground font-inter animate-pulse">
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'skeleton') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        {text && (
          <div className="text-xs text-muted-foreground mt-2 font-inter">
            {text}
          </div>
        )}
      </div>
    )
  }

  return null
}

// Specialized loading components
export function LoadingCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

export function LoadingButton({ 
  children, 
  loading = false, 
  className = '',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  loading?: boolean 
}) {
  return (
    <button 
      className={`relative ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loading size="sm" />
        </div>
      )}
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>
    </button>
  )
}

export function LoadingPage({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-coral-gradient rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] flex items-center justify-center mx-auto mb-4">
          <Loading size="md" variant="spinner" className="text-white" />
        </div>
        <h2 className="font-space text-xl font-medium text-navy mb-2">
          CloudHub
        </h2>
        <p className="text-muted-foreground font-inter">
          {text}
        </p>
      </div>
    </div>
  )
}

export function LoadingOverlay({ 
  visible = true, 
  text = 'Loading...',
  className = '' 
}: { 
  visible?: boolean
  text?: string
  className?: string 
}) {
  if (!visible) return null

  return (
    <div className={`absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <div className="text-center">
        <Loading size="lg" text={text} />
      </div>
    </div>
  )
}