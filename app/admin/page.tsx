import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import { Catalogo } from '@/lib/types'
import Link from 'next/link'
import { BookOpen, Package, LogOut } from 'lucide-react'
import AdminLogout from './AdminLogout'

function getCatalogos(): Catalogo[] {
  const db = getDb()
  return db.prepare(`
    SELECT c.*, COUNT(p.id) as total_produtos
    FROM catalogos c
    LEFT JOIN produtos p ON p.catalogo_id = c.id
    GROUP BY c.id
    ORDER BY c.nome
  `).all() as Catalogo[]
}

function getTotais() {
  const db = getDb()
  const catalogos = (db.prepare('SELECT COUNT(*) as n FROM catalogos').get() as { n: number }).n
  const produtos = (db.prepare('SELECT COUNT(*) as n FROM produtos').get() as { n: number }).n
  return { catalogos, produtos }
}

export default async function AdminPage() {
  const session = await requireAdmin().catch(() => null)
  if (!session) redirect('/admin/login')

  const catalogos = getCatalogos()
  const totais = getTotais()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header admin */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Painel Admin</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">interno</span>
          </div>
          <AdminLogout />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Resumo */}
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-900">{totais.catalogos}</p>
            <p className="text-sm text-gray-400 mt-1">Fornecedores</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-900">{totais.produtos}</p>
            <p className="text-sm text-gray-400 mt-1">Produtos</p>
          </div>
        </div>

        {/* Lista de fornecedores */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fornecedores / Catálogos</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Fornecedor</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Ano</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Produtos</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {catalogos.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{c.nome}</td>
                    <td className="px-5 py-3 text-gray-400">{c.ano ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <Package className="w-3.5 h-3.5" />
                        {c.total_produtos}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/catalogo/${encodeURIComponent(c.pasta)}`}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Ver produtos →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
