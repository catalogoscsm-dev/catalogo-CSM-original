'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, LogOut } from 'lucide-react'
import LoginModal from './LoginModal'

export default function AdminButton({ isAdmin }: { isAdmin: boolean }) {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.refresh()
  }

  if (isAdmin) {
    return (
      <button onClick={logout}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
        style={{ background: 'rgba(184,151,58,0.12)', color: 'var(--bronze)', border: '1px solid rgba(184,151,58,0.3)' }}>
        <Shield className="w-3.5 h-3.5" />
        Admin
        <LogOut className="w-3 h-3 opacity-60" />
      </button>
    )
  }

  return (
    <>
      <button onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
        style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.color = 'var(--bronze)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(184,151,58,0.4)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.color = 'var(--muted)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        }}>
        <Shield className="w-3.5 h-3.5" />
        Área Admin
      </button>
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
    </>
  )
}
