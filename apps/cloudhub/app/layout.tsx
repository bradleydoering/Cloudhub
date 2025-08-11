import type { Metadata } from 'next'
import { spaceGrotesk, inter, jetbrainsMono } from '../src/lib/fonts'
import '../src/styles/base.css'

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
        <div className="min-h-screen bg-background">
          <nav className="navbar navbar--glass bg-white/90 backdrop-blur-glass border-b border-border">
            <div className="container-custom">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <a href="/" className="flex items-center">
                    <img 
                      src="https://img.cloudrenovation.ca/Cloud%20Renovation%20logos/Cloud_Renovation_Logo-removebg-preview.png"
                      alt="CloudReno"
                      className="h-8 md:h-12"
                    />
                    <div className="ml-3 hidden sm:block">
                      <div className="text-sm font-space font-semibold text-navy">CloudHub</div>
                      <div className="text-xs text-muted-foreground">Staff Portal</div>
                    </div>
                  </a>
                  <div className="ml-8 hidden md:flex space-x-6">
                    <a href="/" className="text-navy hover:text-coral transition font-medium px-3 py-2 rounded-lg hover:bg-coral/10">Dashboard</a>
                    <a href="/deals" className="text-navy hover:text-coral transition font-medium px-3 py-2 rounded-lg hover:bg-coral/10">Deals</a>
                    <a href="/projects" className="text-navy hover:text-coral transition font-medium px-3 py-2 rounded-lg hover:bg-coral/10">Projects</a>
                    <a href="/customers" className="text-navy hover:text-coral transition font-medium px-3 py-2 rounded-lg hover:bg-coral/10">Customers</a>
                    <a href="/settings" className="text-navy hover:text-coral transition font-medium px-3 py-2 rounded-lg hover:bg-coral/10">Settings</a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex items-center space-x-3">
                    <select className="text-sm border border-input bg-background text-foreground px-3 py-1.5 rounded-lg font-medium [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]">
                      <option>CloudReno North Vancouver</option>
                      <option>CloudReno Vancouver</option>
                      <option>CloudReno Richmond</option>
                    </select>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="hidden lg:block">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-coral rounded-full flex items-center justify-center text-white font-medium text-sm">
                      SC
                    </div>
                    <div className="hidden sm:block text-sm">
                      <div className="font-medium text-navy">Sarah Chen</div>
                      <div className="text-xs text-muted-foreground">Project Manager</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main className="container-custom pt-20 pb-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}