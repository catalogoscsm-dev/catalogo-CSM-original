'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

async function checkAdminStatus(): Promise<boolean> {
  // 1. Tenta verificar pelo cookie httpOnly via API (Vercel)
  try {
    const r = await fetch('/api/admin/check', { cache: 'no-store' })
    if (r.status !== 404) return r.ok
  } catch {}
  // 2. Fallback para GitHub Pages: cookie de UI client-side
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some(c => c.trim().startsWith('csm_admin_ui='))
}

export default function AdminBanner({ serverAdmin = false }: { serverAdmin?: boolean }) {
  const [visible, setVisible] = useState(serverAdmin)
  const router = useRouter()

  useEffect(() => {
    if (serverAdmin) { setVisible(true); return }
    checkAdminStatus().then(setVisible)
  }, [serverAdmin])

  function logout() {
    document.cookie = 'csm_admin_ui=; path=/; max-age=0'
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
