import Link from 'next/link'
import Image from 'next/image'
import AdminButton from './AdminButton'

interface Props { isAdmin: boolean }

export default function Header({ isAdmin }: Props) {
  return (
    <header className="site-header sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center transition-opacity duration-200 hover:opacity-75">
            <Image
              src="/logo-csm.png"
              alt="CSM - Campinas Shopping Móveis"
              width={72}
              height={28}
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
