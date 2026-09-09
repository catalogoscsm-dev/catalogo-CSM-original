import Link from 'next/link'
import Image from 'next/image'
import AdminButton from './AdminButton'

interface Props { isAdmin: boolean }

export default function Header({ isAdmin }: Props) {
  return (
    <header className="sticky top-0 z-40" style={{
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(184,151,58,0.12)',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center transition-opacity duration-200 hover:opacity-80">
            <Image
              src="/logo-csm.png"
              alt="CSM - Campinas Shopping Móveis"
              width={80}
              height={32}
              className="object-contain"
              priority
            />
          </Link>
          <AdminButton isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  )
}
