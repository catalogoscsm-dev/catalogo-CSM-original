import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { getSession } from '@/lib/auth'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Catálogo CSM',
  description: 'Catálogo CSM de produtos de móveis e decoração',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const isAdmin = session?.role === 'admin'

  return (
    <html lang="pt-BR">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <Header isAdmin={!!isAdmin} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
