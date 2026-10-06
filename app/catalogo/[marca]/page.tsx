import { getCatalogos, getCatalogoPorPasta, getProdutosPorCatalogo } from '@/lib/data'
import ProductCard from '@/components/ProductCard'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export async function generateStaticParams() {
  return getCatalogos().map(c => ({ marca: encodeURIComponent(c.pasta) }))
}

export default async function CatalogoPage({ params }: { params: Promise<{ marca: string }> }) {
  const { marca } = await params
  const catalogo = getCatalogoPorPasta(decodeURIComponent(marca))
  if (!catalogo) notFound()

  const produtosRaw = getProdutosPorCatalogo(catalogo.pasta)
  // DEV: last cataloged first — pagina DESC (revert to images-first for production)
  const produtos = [...produtosRaw].sort((a, b) => (b.pagina ?? 0) - (a.pagina ?? 0))
  const newIds = new Set(produtosRaw.filter(p => p.imagens.length > 0).map(p => p.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/catalogos" className="transition-colors duration-200 hover:opacity-70"
          style={{ color: 'var(--g)' }}>
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="_fd" style={{ color: 'var(--f)', fontSize: '2rem', fontWeight: 400 }}>{catalogo.nome}</h1>
          <p className="text-sm" style={{ color: 'var(--g)' }}>{catalogo.total_produtos} produto(s)</p>
        </div>
      </div>

      {produtos.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--g)' }}>
          <p>Nenhum produto importado para este catálogo ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {produtos.map(p => (
            <div key={p.id} className="relative">
              {newIds.has(p.id) && (
                <span className="absolute top-2 left-2 z-10 text-xs font-bold px-2 py-0.5 rounded-full pointer-events-none"
                  style={{ background: 'var(--j)', color: '#fff', letterSpacing: '0.05em' }}>
                  NEW
                </span>
              )}
              <ProductCard produto={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
