import type { Metadata } from 'next'
import { spaceGrotesk, inter, jetbrainsMono } from '../src/lib/fonts'
import '../src/styles/base.css'
import { NotificationProvider } from '../src/components/NotificationSystem'
import { NotificationBell } from '../src/components/NotificationBell'
import ErrorBoundary from '../src/components/ErrorBoundary'
import { LocationProvider } from '../src/context/LocationContext'
import LocationSelector from '../src/components/LocationSelector'

export const metadata: Metadata = {
  title: 'CloudHub — Staff Portal | CloudReno',
  description: 'CloudReno staff application for managing deals and projects. Structured, stress-free kitchen & bath renovations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-inter">
        <NotificationProvider>
          <LocationProvider>
            <div className="min-h-screen bg-background dot-grid-bg flex">
          {/* Sidebar */}
          <div className="w-64 bg-navy flex-shrink-0 flex flex-col fixed h-full z-10">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <a href="/" className="flex items-center">
                  <img 
                    src="https://img.cloudrenovation.ca/Cloud%20Renovation%20logos/Cloud_Renovation_Logo-removebg-preview.png"
                    alt="CloudReno"
                    className="h-8"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-space font-semibold text-white">CloudHub</div>
                    <div className="text-xs text-white/60">Staff Portal</div>
                  </div>
                </a>
                <NotificationBell />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                <a href="/" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  <svg className="mr-3 w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Dashboard
                </a>
                <a href="/deals" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  <svg className="mr-3 w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  Deals
                </a>
                <a href="/projects" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  <svg className="mr-3 w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Projects
                </a>
                <a href="/customers" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  <svg className="mr-3 w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Customers
                </a>
                <a href="/settings" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  <svg className="mr-3 w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Settings
                </a>
              </div>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-coral rounded-full flex items-center justify-center text-white font-medium text-sm">
                  SC
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">Sarah Chen</div>
                  <div className="text-xs text-white/60">Project Manager</div>
                </div>
              </div>
              <div className="mt-3">
                <LocationSelector />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col ml-64">
            <main className="flex-1 p-8">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
          </div>
        </div>
          </LocationProvider>
        </NotificationProvider>
      </body>
    </html>
  )
}