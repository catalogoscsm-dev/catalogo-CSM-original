import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { ThemeProvider } from '@/components/ThemeProvider'
import SearchToolbar from '@/components/SearchToolbar'
import PageTransition from '@/components/PageTransition'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Catálogo CSM',
  description: 'Catálogo CSM de produtos de móveis e decoração',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} min-h-screen`}>
        <ThemeProvider>
          <Header isAdmin={false} />
          <Suspense>
            <SearchToolbar />
          </Suspense>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
