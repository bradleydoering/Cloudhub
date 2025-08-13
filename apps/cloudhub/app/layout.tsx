import type { Metadata } from 'next'
import { spaceGrotesk, inter, jetbrainsMono } from '../src/lib/fonts'
import '../src/styles/base.css'
import { NotificationProvider } from '../src/components/NotificationSystem'
import { NotificationBell } from '../src/components/NotificationBell'
import ErrorBoundary from '../src/components/ErrorBoundary'

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
                  <span className="mr-3">📊</span>
                  Dashboard
                </a>
                <a href="/deals" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  <span className="mr-3">💼</span>
                  Deals
                </a>
                <a href="/projects" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  <span className="mr-3">🏗️</span>
                  Projects
                </a>
                <a href="/customers" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  <span className="mr-3">👥</span>
                  Customers
                </a>
                <a href="/settings" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  <span className="mr-3">⚙️</span>
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
                <select className="w-full text-xs border border-white/20 bg-white/10 text-white px-3 py-2 rounded-lg font-medium [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]">
                  <option>North Vancouver</option>
                  <option>Vancouver</option>
                  <option>Richmond</option>
                </select>
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
        </NotificationProvider>
      </body>
    </html>
  )
}