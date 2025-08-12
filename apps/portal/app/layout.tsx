import type { Metadata } from 'next'
import { spaceGrotesk, inter, jetbrainsMono } from '../src/lib/fonts'
import '../src/styles/base.css'

export const metadata: Metadata = {
  title: 'CloudHub — Customer Portal | CloudReno',
  description: 'CloudReno customer portal for project updates, documents, and communications. Structured, stress-free renovations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-inter antialiased">
        <div className="min-h-screen bg-background dot-grid-bg flex">
          {/* Sidebar */}
          <div className="w-64 bg-navy flex-shrink-0 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-coral rounded-sm [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)] flex items-center justify-center">
                  <span className="text-white font-space font-bold text-sm">C</span>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-space font-semibold text-white">CloudHub</div>
                  <div className="text-xs text-white/60">Customer Portal</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                <a href="/" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  <span className="mr-3">🏠</span>
                  Overview
                </a>
                <a href="/timeline" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  <span className="mr-3">📋</span>
                  Timeline
                </a>
                <a href="/documents" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  <span className="mr-3">📄</span>
                  Documents
                </a>
                <a href="/photos" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  <span className="mr-3">📷</span>
                  Photos
                </a>
                <a href="/change-orders" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  <span className="mr-3">📝</span>
                  Change Orders
                </a>
                <a href="/invoices" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">
                  <span className="mr-3">💰</span>
                  Invoices
                </a>
              </div>
            </nav>

            {/* Project Info */}
            <div className="p-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-sm font-medium text-white">Bathroom Renovation</div>
                <div className="text-xs text-white/60">Project #CR-2024-001</div>
                <div className="mt-2">
                  <div className="w-10 h-10 bg-coral rounded-full flex items-center justify-center mx-auto">
                    <span className="text-xs font-medium text-white">JD</span>
                  </div>
                  <div className="text-xs text-white/60 mt-1">John & Jane Doe</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}