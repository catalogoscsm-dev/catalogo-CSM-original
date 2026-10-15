'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

const SESSION_TOKEN = 'csm-admin-session-2025'

function getAdminCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some(c => c.trim() === `csm_admin=${SESSION_TOKEN}`)
}

export default function AdminBanner({ serverAdmin = false }: { serverAdmin?: boolean }) {
  const [visible, setVisible] = useState(serverAdmin)
  const router = useRouter()

  useEffect(() => {
    setVisible(serverAdmin || getAdminCookie())
  }, [serverAdmin])

  function logout() {
    document.cookie = 'csm_admin=; path=/; max-age=0'
    // Tenta API (Vercel), ignora erro em sites estáticos
    fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
    setVisible(false)
    router.refresh()
  }

  if (!visible) return null

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
