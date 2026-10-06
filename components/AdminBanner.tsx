'use client'

import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

export default function AdminBanner() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.refresh()
  }

  return (
    <div className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold"
      style={{ background: 'var(--j)', color: '#fff' }}>
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Modo Vendedor — dados internos visíveis</span>
      </div>
      <button
        onClick={logout}
        className="underline underline-offset-2 hover:opacity-75 transition-opacity"
      >
        Sair
      </button>
    </div>
  )
}
