import Link from 'next/link'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export default function Header() {
  return (
    <header className="site-header sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14">
          <Link href="/" className="flex items-center transition-opacity duration-200 hover:opacity-75">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE}/logo-csm.png`}
              alt="CSM - Campinas Shopping Móveis"
              height={36}
              className="object-contain"
              style={{ height: '36px', width: 'auto' }}
            />
          </Link>
        </div>
      </div>
    </header>
  )
}
