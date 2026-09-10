import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import { Produto, Catalogo } from '@/lib/types'
import Link from 'next/link'
import { ChevronLeft, Package } from 'lucide-react'
import { notFound } from 'next/navigation'

function getCatalogo(pasta: string): Catalogo | null {
  const db = getDb()
  return db.prepare(`
    SELECT c.*, COUNT(p.id) as total_produtos
    FROM catalogos c
    LEFT JOIN produtos p ON p.catalogo_id = c.id
    WHERE c.pasta = ?
    GROUP BY c.id
  `).get(decodeURIComponent(pasta)) as Catalogo | null
}

function getProdutos(catalogoId: number): Produto[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT p.*, c.nome as catalogo_nome
    FROM produtos p
    JOIN catalogos c ON p.catalogo_id = c.id
    WHERE p.catalogo_id = ?
    ORDER BY p.pagina, p.nome
  `).all(catalogoId) as (Produto & { imagens: string })[]
  return rows.map(r => ({ ...r, imagens: JSON.parse(r.imagens ?? '[]') }))
}

export async function generateStaticParams() { return [{ marca: '_' }] }

export default async function AdminCatalogoPage({ params }: { params: Promise<{ marca: string }> }) {
  const session = await requireAdmin().catch(() => null)
  if (!session) redirect('/admin/login')

  const { marca } = await params
  const catalogo = getCatalogo(marca)
  if (!catalogo) notFound()

  const produtos = getProdutos(catalogo.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-gray-900">{catalogo.nome}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">fornecedor</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Produto</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Código</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Material</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Dimensões</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Pág.</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {produtos.map(p => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{p.nome}</td>
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs">{p.codigo ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{p.material ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{p.dimensoes ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-400">{p.pagina ?? '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/produto/${p.id}`}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      Detalhes →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
