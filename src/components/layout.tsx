/// <reference types="react" />

declare module './globals.css'

import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NAVPRARAMBH - Your Career Operating System',
  description: 'AI-powered platform for placement, resume building, skill development, and career guidance',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light bg-background" style={{ colorScheme: 'light' }}>
      <body className="antialiased">
        {/* Subtle Indian tricolour backdrop with a faint Ashoka Chakra watermark */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-background">
          <div className="absolute inset-x-0 top-0 h-1/3 bg-saffron/12" />
          <div className="absolute inset-x-0 top-1/3 h-1/3 bg-card" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-india-green/12" />
          <img
            src="/ashoka-chakra.png"
            alt=""
            className="absolute left-1/2 top-1/2 w-[38vmin] max-w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
          />
        </div>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
