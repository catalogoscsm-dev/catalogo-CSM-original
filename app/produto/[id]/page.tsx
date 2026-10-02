import { getProdutos, getProduto } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ImageZoom from '@/components/ImageZoom'
import FavShare from './FavShare'
import FichaTecnica from '@/components/FichaTecnica'
import DimensoesDisplay from '@/components/DimensoesDisplay'
import ProductNavAnimated from '@/components/ProductNavAnimated'
import ViewTracker from '@/components/ViewTracker'
import { ShieldCheck, ChevronRight } from 'lucide-react'

export async function generateStaticParams() {
  return getProdutos().map(p => ({ id: String(p.id) }))
}

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const produto = getProduto(id)
  if (!produto) notFound()

  const todos    = getProdutos()
  const idx      = todos.findIndex(p => p.id === produto.id)
  const anterior = idx > 0 ? todos[idx - 1] : null
  const proximo  = idx < todos.length - 1 ? todos[idx + 1] : null

  const isAdmin = false

  const fichaPublica = [
    { label: 'Material', value: produto.material },
  ].filter(c => c.value && c.value.trim().length > 1)

  const temDimensoes  = produto.dimensoes  && produto.dimensoes.trim().length  > 1
  const temAcabamento = produto.acabamento && produto.acabamento.trim().length > 1

  const fichaInterna = [
    { label: 'Fornecedor',         value: produto.catalogo_nome },
    { label: 'Código do produto',  value: produto.codigo },
    { label: 'Página no catálogo', value: produto.pagina ? `Pág. ${produto.pagina}` : null },
  ].filter(c => c.value)

  return (
    <ProductNavAnimated
      prevId={anterior?.id ?? null}
      nextId={proximo?.id  ?? null}
    >
      <ViewTracker produtoId={produto.id} />
      <div className="produto-fullbleed">
        <div className="produto-grid">

          <div className="produto-img-col">
            <ImageZoom
              src={produto.imagens[0] ?? null}
              alt={produto.nome}
              thumbnails={produto.imagens}
              fullHeight
            />
          </div>

          <div className="produto-info-col">

            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--g)' }}>
              <Link href="/" className="hover:underline hover:opacity-70 transition-opacity"
                style={{ color: 'var(--g)' }}>
                Início
              </Link>
              <ChevronRight className="w-3 h-3 opacity-40" />
              <span style={{ color: 'var(--f)' }}>{produto.nome}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {produto.descricao && produto.descricao.trim().length > 1 && (
                <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{
                    alignSelf:  'flex-start',
                    background: 'var(--d)',
                    color:      'var(--g)',
                    border:     '1px solid var(--h)',
                  }}>
                  {produto.descricao}
                </span>
              )}
              <h1 className="_fd" style={{
                color:         'var(--f)',
                fontSize:      'clamp(1.8rem, 3.5vw, 2.8rem)',
                fontWeight:    400,
                lineHeight:    1.15,
                letterSpacing: '-0.01em',
              }}>
                {produto.nome}
              </h1>
            </div>

            <FavShare produtoId={produto.id} nomeProduto={produto.nome} />

            <div className="h-px" style={{ background: 'var(--h)' }} />

            {(fichaPublica.length > 0 || temDimensoes || temAcabamento) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {fichaPublica.length > 0 && (
                  <>
                    <h2 className="text-xs uppercase tracking-[0.2em] font-semibold"
                      style={{ color: 'var(--g)' }}>
                      Ficha Técnica
                    </h2>
                    <FichaTecnica items={fichaPublica as { label: string; value: string }[]} />
                  </>
                )}
                <DimensoesDisplay
                  raw={temDimensoes ? produto.dimensoes : null}
                  acabamento={temAcabamento ? produto.acabamento : null}
                />
              </div>
            )}

            {isAdmin && fichaInterna.length > 0 && (
              <div className="rounded-xl p-5 space-y-3"
                style={{ background: 'var(--c)', border: '1px solid var(--h)' }}>
                <div className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--g)' }}>
                  <ShieldCheck className="w-4 h-4" />
                  Dados internos
                </div>
                {fichaInterna.map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <span className="text-xs w-36 shrink-0" style={{ color: 'var(--g)' }}>{label}</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--f)' }}>{value}</span>
                  </div>
                ))}
              </div>
            )}

            {produto.texto_livre && (
              <div className="rounded-xl p-5 space-y-2"
                style={{ background: 'var(--c)', border: '1px solid var(--h)' }}>
                <h2 className="text-xs uppercase tracking-[0.2em] font-semibold"
                  style={{ color: 'var(--g)' }}>
                  Observações
                </h2>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--f)' }}>
                  {produto.texto_livre}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </ProductNavAnimated>
  )
}
