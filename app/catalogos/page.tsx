import { getDb } from '@/lib/db'
import { Catalogo } from '@/lib/types'
import Link from 'next/link'
import { BookOpen, Package } from 'lucide-react'

function getCatalogos(): Catalogo[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT c.*, COUNT(p.id) as total_produtos
    FROM catalogos c
    LEFT JOIN produtos p ON p.catalogo_id = c.id
    GROUP BY c.id
    ORDER BY c.nome
  `).all() as Catalogo[]
  return rows
}

export default function CatalogosPage() {
  const catalogos = getCatalogos()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Catálogos</h1>
        <p className="text-gray-500 mt-1">{catalogos.length} marcas disponíveis</p>
      </div>

      {catalogos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Nenhum catálogo importado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {catalogos.map(c => (
            <Link key={c.id} href={`/catalogo/${encodeURIComponent(c.pasta)}`}>
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-sm leading-tight">{c.nome}</h2>
                  {c.ano && <p className="text-xs text-gray-400 mt-0.5">{c.ano}</p>}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Package className="w-3 h-3" />
                  {c.total_produtos} produto(s)
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
