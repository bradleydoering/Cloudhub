'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@cloudreno/ui'
import { signIn } from '@cloudreno/lib'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
      router.push('/')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-coral-gradient rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-space font-bold text-xl">C</span>
          </div>
          <h1 className="font-space text-3xl font-semibold text-navy mb-2">
            Welcome to CloudHub
          </h1>
          <p className="text-muted-foreground">
            Sign in to your staff account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="glass rounded-lg p-8 [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-navy mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-navy mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="mt-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>

            <div className="mt-4 text-center">
              <a 
                href="/auth/forgot-password"
                className="text-sm text-coral hover:text-coral-dark"
              >
                Forgot your password?
              </a>
            </div>
          </div>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          <p>Staff Access Only • Customer Portal Available Separately</p>
        </div>
      </div>
    </div>
  )
}