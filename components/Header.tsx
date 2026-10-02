import Link from 'next/link'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export default function Header() {
  return (
    <header className="_h sticky top-0 z-40">
      <div className="px-4">
        <div className="flex items-center h-20">
          <Link href="/" className="flex items-center transition-opacity duration-200 hover:opacity-75">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE}/logo-csm.png`}
              alt="CSM - Campinas Shopping Móveis"
              style={{ height: '72px', width: 'auto' }}
            />
          </Link>
        </div>
      </div>
    </header>
  )
}
