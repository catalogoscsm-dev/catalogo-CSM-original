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

  const produtos = getProdutosPorCatalogo(catalogo.pasta)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/catalogos" className="transition-colors duration-200 hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}>
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display" style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 400 }}>{catalogo.nome}</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{catalogo.total_produtos} produto(s)</p>
        </div>
      </div>

      {produtos.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
          <p>Nenhum produto importado para este catálogo ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {produtos.map(p => (
            <ProductCard key={p.id} produto={p} />
          ))}
        </div>
      )}
    </div>
  )
}
