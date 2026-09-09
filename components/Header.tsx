import Link from 'next/link'
import { BookOpen, Heart, Search } from 'lucide-react'
import AdminButton from './AdminButton'

interface Props {
  isAdmin: boolean
}

export default function Header({ isAdmin }: Props) {
  const links = [
    { href: '/', label: 'Início', icon: Search },
    { href: '/favoritos', label: 'Favoritos', icon: Heart },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Catálogo CSM
          </Link>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <AdminButton isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </header>
  )
}
