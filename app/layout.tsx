import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import { ThemeProvider } from '@/components/ThemeProvider'
import PageTransition from '@/components/PageTransition'
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton'
import MobileBottomNav from '@/components/MobileBottomNav'
import AdminBanner from '@/components/AdminBanner'
import MarqueeTicker from '@/components/MarqueeTicker'
import { isAdminSession } from '@/lib/auth'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Catálogo CSM',
  description: 'Catálogo CSM de produtos de móveis e decoração',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CSM',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdminSession()
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#f97316" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          <AdminBanner serverAdmin={admin} />
          <Suspense><Header /></Suspense>
          <MarqueeTicker />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <WhatsAppFloatingButton />
          <Suspense><MobileBottomNav /></Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
