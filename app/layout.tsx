import type { Metadata } from 'next'
import '../styles/globals.css'
import Sidebar from '@/components/Sidebar'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Mission Control 2.0',
  description: 'Personal command center dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-white">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}