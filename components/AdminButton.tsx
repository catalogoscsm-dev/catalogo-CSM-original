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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:opacity-75"
        style={{
          background: 'var(--surface)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
        }}>
        <Shield className="w-3.5 h-3.5" />
        Admin
        <LogOut className="w-3 h-3 opacity-50" />
      </button>
    )
  }

  return (
    <>
      <button onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:opacity-75"
        style={{
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
          background: 'transparent',
        }}>
        <Shield className="w-3.5 h-3.5" />
        Área Admin
      </button>
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
    </>
  )
}
