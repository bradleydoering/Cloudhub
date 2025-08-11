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
                  <img 
                    src="https://img.cloudrenovation.ca/Cloud%20Renovation%20logos/Cloud_Renovation_Logo-removebg-preview.png"
                    alt="CloudReno"
                    className="h-8 md:h-12"
                  />
                  <div className="ml-8 hidden md:flex space-x-6">
                    <a href="/deals" className="text-navy hover:text-coral transition font-medium">Deals</a>
                    <a href="/projects" className="text-navy hover:text-coral transition font-medium">Projects</a>
                    <a href="/settings" className="text-navy hover:text-coral transition font-medium">Settings</a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <select className="text-sm border border-input bg-background text-foreground px-3 py-1 font-medium">
                    <option>CloudReno North Vancouver</option>
                    <option>CloudReno Vancouver</option>
                  </select>
                  <div className="w-8 h-8 bg-coral rounded-full flex items-center justify-center text-white font-medium text-sm">
                    U
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