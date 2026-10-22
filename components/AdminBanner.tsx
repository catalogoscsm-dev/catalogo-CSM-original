'use client'

import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'

export default function AdminBanner({ serverAdmin = false }: { serverAdmin?: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const check = () => setVisible(document.cookie.includes('csm_admin_ui=1'))
    check()
    window.addEventListener('csm-admin-change', check)
    return () => window.removeEventListener('csm-admin-change', check)
  }, [])

  function logout() {
    document.cookie = 'csm_admin_ui=; path=/; max-age=0'
    window.dispatchEvent(new CustomEvent('csm-admin-change'))
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
