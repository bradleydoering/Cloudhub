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
        <div className="min-h-screen bg-offwhite">
          <nav className="navbar navbar--glass">
            <div className="container-custom">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-coral-gradient rounded-sm [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)] flex items-center justify-center">
                      <span className="text-white font-space font-bold text-sm">C</span>
                    </div>
                    <div>
                      <h1 className="text-lg font-space font-semibold text-navy">CloudHub</h1>
                      <span className="text-xs text-muted-foreground">Customer Portal</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-navy">Bathroom Renovation</div>
                    <div className="text-xs text-muted-foreground">Project #CR-2024-001</div>
                  </div>
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-secondary-foreground">JD</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main className="pt-20">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}