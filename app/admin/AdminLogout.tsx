'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function AdminLogout() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <button
      onClick={logout}
      className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sair
    </button>
  )
}
