'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, LogOut } from 'lucide-react'
import LoginModal from './LoginModal'

interface Props {
  isAdmin: boolean
}

export default function AdminButton({ isAdmin }: Props) {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.refresh()
  }

  if (isAdmin) {
    return (
      <button
        onClick={logout}
        className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-colors font-medium"
      >
        <Shield className="w-3.5 h-3.5" />
        Admin
        <LogOut className="w-3 h-3 ml-1 opacity-60" />
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors"
      >
        <Shield className="w-3.5 h-3.5" />
        Área Admin
      </button>
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
    </>
  )
}
