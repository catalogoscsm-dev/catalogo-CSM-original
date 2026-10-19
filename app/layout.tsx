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
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: 'Catálogo CSM',
  description: 'Catálogo CSM de produtos de móveis e decoração',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? '/'
  const isAdminPage = pathname.startsWith('/admin')
  const admin = await isAdminSession()

  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <ThemeProvider>
          {!isAdminPage && <AdminBanner serverAdmin={admin} />}
          {!isAdminPage && <Suspense><Header /></Suspense>}
          {!isAdminPage && <MarqueeTicker />}
          <main className={isAdminPage ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8'}>
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          {!isAdminPage && <WhatsAppFloatingButton />}
          {!isAdminPage && <Suspense><MobileBottomNav /></Suspense>}
        </ThemeProvider>
      </body>
    </html>
  )
}
