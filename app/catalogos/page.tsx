import { getCatalogos } from '@/lib/data'
import Link from 'next/link'
import { BookOpen, Package } from 'lucide-react'

export default function CatalogosPage() {
  const catalogos = getCatalogos()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display" style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 400 }}>Catálogos</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{catalogos.length} marcas disponíveis</p>
      </div>

      {catalogos.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Nenhum catálogo importado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {catalogos.map(c => (
            <Link key={c.id} href={`/catalogo/${encodeURIComponent(c.pasta)}`}>
              <div className="catalog-card rounded-xl p-5 space-y-3 transition-all duration-200 cursor-pointer"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--surface-hover)' }}>
                  <BookOpen className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div>
                  <h2 className="font-semibold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>{c.nome}</h2>
                  {c.ano && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.ano}</p>}
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
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
